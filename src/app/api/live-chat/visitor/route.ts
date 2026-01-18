import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ChatConversation, ChatMessage } from "@/types/live-chat";

// Create a Supabase client for API routes
// Requires service role key for elevated privileges (bypasses RLS)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET: Fetch visitor's conversation and messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitor_id");
    const conversationId = searchParams.get("conversation_id");

    // Validate visitor_id
    if (!visitorId || !UUID_REGEX.test(visitorId)) {
      return NextResponse.json(
        { error: "Valid visitor_id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // If conversation_id is provided, fetch messages for that conversation
    if (conversationId) {
      if (!UUID_REGEX.test(conversationId)) {
        return NextResponse.json(
          { error: "Invalid conversation_id format" },
          { status: 400 }
        );
      }

      // Verify the conversation belongs to this visitor and get full conversation data
      const { data: conversation, error: convError } = await supabase
        .from("sws2026_chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (convError || !conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Security: Only allow access to visitor's own conversation
      if (conversation.visitor_id !== visitorId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      // Fetch messages for the conversation
      const { data: messages, error: msgError } = await supabase
        .from("sws2026_chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error("Error fetching messages:", msgError);
        return NextResponse.json(
          { error: "Failed to fetch messages" },
          { status: 500 }
        );
      }

      // Return messages AND conversation (so visitor can see status changes)
      return NextResponse.json({
        messages: (messages || []) as ChatMessage[],
        conversation: conversation as ChatConversation,
      });
    }

    // Fetch the visitor's active conversation only
    // Closed conversations are not returned - visitor can start fresh
    const { data: conversation, error } = await supabase
      .from("sws2026_chat_conversations")
      .select("*")
      .eq("visitor_id", visitorId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching conversation:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      );
    }

    // If conversation exists, also fetch its messages
    let messages: ChatMessage[] = [];
    if (conversation) {
      const { data: msgs, error: msgError } = await supabase
        .from("sws2026_chat_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error("Error fetching messages:", msgError);
      } else {
        messages = (msgs || []) as ChatMessage[];
      }
    }

    return NextResponse.json({
      conversation: conversation as ChatConversation | null,
      messages,
    });
  } catch (error) {
    console.error("Visitor API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
