"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getConversations,
  getConversationById,
  getMessages,
  getLiveChatSettings,
} from "@/lib/supabase/queries/live-chat";
import {
  createMessage,
  markMessagesAsRead,
  updateConversationStatus,
  toggleAdminOnline,
} from "@/lib/supabase/mutations/live-chat";
import type {
  ChatConversationWithDetails,
  ChatMessage,
  TypingState,
  VisitorTypingPayload,
  LiveChatSettings,
} from "@/types/live-chat";

interface UseAdminChatReturn {
  conversations: ChatConversationWithDetails[];
  activeConversation: ChatConversationWithDetails | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  settings: LiveChatSettings | null;
  visitorTyping: TypingState;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setAdminTyping: (isTyping: boolean) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
  toggleOnline: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  clearActiveConversation: () => void;
}

export function useAdminChat(): UseAdminChatReturn {
  const [conversations, setConversations] = useState<ChatConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<LiveChatSettings | null>(null);
  const [visitorTyping, setVisitorTyping] = useState<TypingState>({ isTyping: false });

  const conversationChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visitorTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data
  const refreshConversations = useCallback(async () => {
    try {
      const [convs, settingsData] = await Promise.all([
        getConversations(),
        getLiveChatSettings(),
      ]);
      setConversations(convs);
      setSettings(settingsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();

    // Subscribe to new conversations and settings changes
    const supabase = createClient();

    const conversationsChannel = supabase
      .channel("admin-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sws2026_chat_conversations",
        },
        () => {
          // Refresh conversations list on any change
          refreshConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sws2026_live_chat_settings",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            setSettings(payload.new as LiveChatSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [refreshConversations]);

  // Subscribe to active conversation updates
  useEffect(() => {
    if (!activeConversation) {
      // Clear visitor typing when no active conversation
      setVisitorTyping({ isTyping: false });
      return;
    }

    const supabase = createClient();
    const channelName = `live-chat:conversation:${activeConversation.id}`;

    // Unsubscribe from previous conversation
    if (conversationChannelRef.current) {
      supabase.removeChannel(conversationChannelRef.current);
    }

    const channel = supabase
      .channel(channelName)
      // Listen for new messages
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sws2026_chat_messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Auto mark as read if from visitor
          if (newMessage.sender_type === "visitor") {
            markMessagesAsRead(activeConversation.id);
          }

          // Refresh conversation list to update unread counts
          refreshConversations();
        }
      )
      // Listen for visitor typing
      .on("broadcast", { event: "visitor-typing" }, (payload) => {
        const typingPayload = payload.payload as VisitorTypingPayload;
        setVisitorTyping({
          isTyping: typingPayload.typing,
          text: typingPayload.text,
        });

        // Clear typing indicator after 3 seconds of inactivity
        if (visitorTypingTimeoutRef.current) {
          clearTimeout(visitorTypingTimeoutRef.current);
        }
        if (typingPayload.typing) {
          visitorTypingTimeoutRef.current = setTimeout(() => {
            setVisitorTyping({ isTyping: false });
          }, 3000);
        }
      })
      .subscribe();

    conversationChannelRef.current = channel;

    return () => {
      if (visitorTypingTimeoutRef.current) {
        clearTimeout(visitorTypingTimeoutRef.current);
      }
    };
  }, [activeConversation, refreshConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (visitorTypingTimeoutRef.current) {
        clearTimeout(visitorTypingTimeoutRef.current);
      }
      if (conversationChannelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(conversationChannelRef.current);
      }
    };
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (id: string) => {
    try {
      const conversation = await getConversationById(id);
      if (conversation) {
        setActiveConversation(conversation);
        const msgs = await getMessages(id);
        setMessages(msgs);
        // Mark messages as read
        await markMessagesAsRead(id);
        // Refresh to update unread counts
        refreshConversations();
      }
    } catch (err) {
      console.error("Error selecting conversation:", err);
      setError("Failed to load conversation");
    }
  }, [refreshConversations]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !content.trim()) return;

      try {
        const result = await createMessage({
          conversation_id: activeConversation.id,
          sender_type: "admin",
          content: content.trim(),
        });

        if (result.error) {
          setError(result.error);
        }
        // Message will be added via real-time subscription
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    },
    [activeConversation]
  );

  // Broadcast admin typing state
  const setAdminTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationChannelRef.current) return;

      conversationChannelRef.current.send({
        type: "broadcast",
        event: "admin-typing",
        payload: { typing: isTyping },
      });

      // Clear typing after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (conversationChannelRef.current) {
            conversationChannelRef.current.send({
              type: "broadcast",
              event: "admin-typing",
              payload: { typing: false },
            });
          }
        }, 2000);
      }
    },
    []
  );

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    await markMessagesAsRead(conversationId);
    refreshConversations();
  }, [refreshConversations]);

  // Close a conversation
  const closeConversation = useCallback(
    async (conversationId: string) => {
      try {
        // Send a closing message to the visitor first
        await createMessage({
          conversation_id: conversationId,
          sender_type: "admin",
          content: "This conversation has been closed. Thank you for chatting with us!",
        });

        const result = await updateConversationStatus(conversationId, "closed");
        if (result.error) {
          setError(result.error);
          return;
        }

        // Clear active conversation if it was the one closed
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }

        refreshConversations();
      } catch (err) {
        console.error("Error closing conversation:", err);
        setError("Failed to close conversation");
      }
    },
    [activeConversation, refreshConversations]
  );

  // Toggle admin online status
  const toggleOnline = useCallback(async () => {
    if (!settings) return;

    try {
      const result = await toggleAdminOnline(!settings.is_online);
      if (result.error) {
        setError(result.error);
      }
      // Settings will be updated via real-time subscription
    } catch (err) {
      console.error("Error toggling online status:", err);
      setError("Failed to update status");
    }
  }, [settings]);

  // Clear active conversation (used after deleting)
  const clearActiveConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    settings,
    visitorTyping,
    selectConversation,
    sendMessage,
    setAdminTyping,
    markAsRead,
    closeConversation,
    toggleOnline,
    refreshConversations,
    clearActiveConversation,
  };
}
