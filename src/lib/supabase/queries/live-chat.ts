import { createClient } from "@/lib/supabase/client";
import type {
  LiveChatSettings,
  ChatConversation,
  ChatConversationWithDetails,
  ChatMessage,
} from "@/types/live-chat";

// Get live chat settings (admin online status)
export async function getLiveChatSettings(): Promise<LiveChatSettings | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_live_chat_settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching live chat settings:", error);
    return null;
  }

  return data;
}

// Get all conversations for admin
export async function getConversations(): Promise<ChatConversationWithDetails[]> {
  const supabase = createClient();

  const { data: conversations, error } = await supabase
    .from("sws2026_chat_conversations")
    .select(`
      *,
      post:sws2026_blog_posts(id, title, slug)
    `)
    .order("last_message_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  // Get last message and unread count for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from("sws2026_chat_messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get unread count (messages from visitor that are not read)
      const { count: unreadCount } = await supabase
        .from("sws2026_chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "visitor")
        .eq("is_read", false);

      // Check if admin has replied
      const { count: adminMessageCount } = await supabase
        .from("sws2026_chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "admin");

      return {
        ...conv,
        last_message: lastMessage || null,
        unread_count: unreadCount || 0,
        admin_has_replied: (adminMessageCount || 0) > 0,
      } as ChatConversationWithDetails;
    })
  );

  return conversationsWithDetails;
}

// Get conversation by ID
export async function getConversationById(
  id: string
): Promise<ChatConversationWithDetails | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_chat_conversations")
    .select(`
      *,
      post:sws2026_blog_posts(id, title, slug)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }

  return data as ChatConversationWithDetails;
}

// Get conversation by visitor ID
export async function getConversationByVisitorId(
  visitorId: string
): Promise<ChatConversation | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_chat_conversations")
    .select("*")
    .eq("visitor_id", visitorId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching conversation by visitor ID:", error);
  }

  return data || null;
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

// Get unread message count for all conversations (for badge)
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("sws2026_chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_type", "visitor")
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}
