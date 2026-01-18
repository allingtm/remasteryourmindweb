"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  ChatMessage,
  ChatConversation,
  TypingState,
  VisitorTypingPayload,
  AdminTypingPayload,
} from "@/types/live-chat";

interface UseLiveChatOptions {
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  postId?: string;
  sourceUrl?: string;
  consentGiven?: boolean;
}

interface UseLiveChatReturn {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  adminTyping: TypingState;
  setVisitorTyping: (isTyping: boolean, text?: string) => void;
  startConversation: () => Promise<ChatConversation | null>;
}

export function useLiveChat({
  visitorId,
  visitorName,
  visitorEmail,
  postId,
  sourceUrl,
  consentGiven = false,
}: UseLiveChatOptions): UseLiveChatReturn {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminTyping, setAdminTyping] = useState<TypingState>({ isTyping: false });

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch existing conversation for this visitor (via API route for RLS bypass)
  useEffect(() => {
    if (!visitorId) return;

    async function fetchConversation() {
      try {
        const response = await fetch(`/api/live-chat/visitor?visitor_id=${visitorId}`);
        const result = await response.json();

        if (response.ok && result.conversation) {
          setConversation(result.conversation);
          setMessages(result.messages || []);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversation();
  }, [visitorId]);

  // Poll for new messages and conversation updates (RLS prevents postgres_changes for visitors)
  useEffect(() => {
    if (!conversation || !visitorId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/live-chat/visitor?visitor_id=${visitorId}&conversation_id=${conversation.id}`
        );
        const result = await response.json();

        if (response.ok) {
          // Update messages if changed
          if (result.messages) {
            setMessages((prev) => {
              // Only update if there are new messages
              if (result.messages.length !== prev.length) {
                return result.messages;
              }
              // Check if last message is different
              const lastNew = result.messages[result.messages.length - 1];
              const lastPrev = prev[prev.length - 1];
              if (lastNew?.id !== lastPrev?.id) {
                return result.messages;
              }
              return prev;
            });
          }

          // Update conversation status if changed (e.g., admin closed the chat)
          if (result.conversation) {
            setConversation((prev) => {
              if (prev?.status !== result.conversation.status) {
                return result.conversation;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [conversation, visitorId]);

  // Subscribe to broadcast events (typing indicators still work via broadcast)
  useEffect(() => {
    if (!conversation) return;

    const supabase = createClient();
    const channelName = `live-chat:conversation:${conversation.id}`;

    const channel = supabase
      .channel(channelName)
      // Listen for admin typing (broadcast doesn't require RLS)
      .on("broadcast", { event: "admin-typing" }, (payload) => {
        const typingPayload = payload.payload as AdminTypingPayload;
        setAdminTyping({ isTyping: typingPayload.typing });

        // Clear typing indicator after 3 seconds of inactivity
        if (adminTypingTimeoutRef.current) {
          clearTimeout(adminTypingTimeoutRef.current);
        }
        if (typingPayload.typing) {
          adminTypingTimeoutRef.current = setTimeout(() => {
            setAdminTyping({ isTyping: false });
          }, 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Start a new conversation (uses API route for IP capture)
  const startConversation = useCallback(async (): Promise<ChatConversation | null> => {
    if (!visitorId) return null;

    try {
      // Use API route to capture visitor IP (only if consent given)
      const response = await fetch("/api/live-chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId,
          visitor_name: visitorName,
          visitor_email: visitorEmail,
          post_id: postId,
          source_url: sourceUrl,
          consent_given: consentGiven,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to start conversation");
        return null;
      }

      if (!result.conversation) {
        setError("Failed to start conversation");
        return null;
      }

      setConversation(result.conversation);

      // Send email notification to admin (fire and forget)
      fetch("/api/live-chat/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: result.conversation.id,
          visitorId,
          postTitle: result.postTitle,
          sourceUrl,
        }),
      }).catch((err) => {
        // Don't block on notification failure
        console.error("Failed to send chat notification:", err);
      });

      return result.conversation;
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
      return null;
    }
  }, [visitorId, visitorName, visitorEmail, postId, sourceUrl, consentGiven]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let currentConversation = conversation;

      // Start conversation if it doesn't exist
      if (!currentConversation) {
        currentConversation = await startConversation();
        if (!currentConversation) return;
      }

      try {
        // Don't allow sending messages to closed conversations
        if (currentConversation.status === "closed") {
          setError("This conversation has been closed");
          return;
        }

        // Use API route for visitor messages (service role bypasses RLS)
        const response = await fetch("/api/live-chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: currentConversation.id,
            content: content.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to send message");
        }
        // Message will be added via real-time subscription
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    },
    [conversation, startConversation]
  );

  // Broadcast visitor typing state (only isTyping boolean for privacy)
  const setVisitorTyping = useCallback(
    (isTyping: boolean, _text?: string) => {
      if (!channelRef.current) return;

      // Security: Only broadcast typing status, not the actual text content
      // This prevents exposing message content before the user hits send
      const payload: VisitorTypingPayload = {
        typing: isTyping,
        text: "", // Never send actual text for privacy
        visitor_id: visitorId,
      };

      channelRef.current.send({
        type: "broadcast",
        event: "visitor-typing",
        payload,
      });

      // Clear typing after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (channelRef.current) {
            channelRef.current.send({
              type: "broadcast",
              event: "visitor-typing",
              payload: { typing: false, text: "", visitor_id: visitorId },
            });
          }
        }, 2000);
      }
    },
    [visitorId]
  );

  return {
    conversation,
    messages,
    isLoading,
    error,
    sendMessage,
    adminTyping,
    setVisitorTyping,
    startConversation,
  };
}
