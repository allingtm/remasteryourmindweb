import { createClient } from "@/lib/supabase/client";
import type {
  ChatConversation,
  ChatMessage,
  CreateConversationPayload,
  CreateMessagePayload,
} from "@/types/live-chat";

// Security: Maximum message length to prevent abuse
const MAX_MESSAGE_LENGTH = 5000;

// Toggle admin online status
export async function toggleAdminOnline(
  isOnline: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sws2026_live_chat_settings")
    .update({ is_online: isOnline, updated_at: new Date().toISOString() })
    .eq("id", (await supabase.from("sws2026_live_chat_settings").select("id").single()).data?.id);

  if (error) {
    console.error("Error toggling admin online:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Create a new conversation
export async function createConversation(
  payload: CreateConversationPayload
): Promise<{ conversation: ChatConversation | null; postTitle?: string; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_chat_conversations")
    .insert({
      visitor_id: payload.visitor_id,
      visitor_name: payload.visitor_name || null,
      post_id: payload.post_id || null,
      source_url: payload.source_url || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    return { conversation: null, error: error.message };
  }

  // Fetch post title if post_id is provided
  let postTitle: string | undefined;
  if (payload.post_id) {
    const { data: post } = await supabase
      .from("sws2026_blog_posts")
      .select("title")
      .eq("id", payload.post_id)
      .single();
    postTitle = post?.title;
  }

  return { conversation: data, postTitle };
}

// Create a new message
export async function createMessage(
  payload: CreateMessagePayload
): Promise<{ message: ChatMessage | null; error?: string }> {
  // Validate message length
  if (payload.content.length > MAX_MESSAGE_LENGTH) {
    return {
      message: null,
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("sws2026_chat_messages")
    .insert({
      conversation_id: payload.conversation_id,
      sender_type: payload.sender_type,
      content: payload.content,
      is_read: payload.sender_type === "admin", // Admin messages are read by default
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating message:", error);
    return { message: null, error: error.message };
  }

  // Update conversation's last_message_at
  await supabase
    .from("sws2026_chat_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", payload.conversation_id);

  return { message: data };
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sws2026_chat_messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("sender_type", "visitor")
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update conversation status
export async function updateConversationStatus(
  conversationId: string,
  status: "active" | "closed" | "archived"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sws2026_chat_conversations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    console.error("Error updating conversation status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update visitor name
export async function updateVisitorName(
  conversationId: string,
  visitorName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sws2026_chat_conversations")
    .update({ visitor_name: visitorName, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    console.error("Error updating visitor name:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete conversation (admin only)
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("sws2026_chat_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error("Error deleting conversation:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Block an IP address (uses API route for admin auth)
export async function blockIP(
  ipAddress: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/live-chat/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip_address: ipAddress,
        reason,
        action: "block",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to block IP" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error blocking IP:", err);
    return { success: false, error: "Failed to block IP" };
  }
}

// Unblock an IP address (uses API route for admin auth)
export async function unblockIP(
  ipAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/live-chat/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip_address: ipAddress,
        action: "unblock",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to unblock IP" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error unblocking IP:", err);
    return { success: false, error: "Failed to unblock IP" };
  }
}
