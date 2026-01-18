import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/types/live-chat";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// Security: Maximum message length to prevent abuse
const MAX_MESSAGE_LENGTH = 5000;

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

interface CreateMessageBody {
  conversation_id: string;
  content: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(clientIP, "chatMessage", RATE_LIMITS.chatMessage);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body: CreateMessageBody = await request.json();
    const { conversation_id, content } = body;

    // Validate required fields
    if (!conversation_id) {
      return NextResponse.json(
        { error: "conversation_id is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    // Validate conversation_id is a valid UUID format
    if (!UUID_REGEX.test(conversation_id)) {
      return NextResponse.json(
        { error: "Invalid conversation_id format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if IP is blocked (skip for localhost/development)
    if (clientIP && clientIP !== "::1" && clientIP !== "127.0.0.1") {
      const { data: blockedIP, error: blockCheckError } = await supabase
        .from("sws2026_blocked_ips")
        .select("id")
        .eq("ip_address", clientIP)
        .single();

      if (blockCheckError && blockCheckError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected for non-blocked IPs
        console.error("Error checking blocked IP:", blockCheckError);
      }

      if (blockedIP) {
        console.log(`Blocked IP ${clientIP} attempted to send message`);
        return NextResponse.json(
          { error: "You are not allowed to send messages" },
          { status: 403 }
        );
      }
    }

    // Verify the conversation exists and is active
    const { data: conversation, error: convError } = await supabase
      .from("sws2026_chat_conversations")
      .select("id, status")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.status === "closed") {
      return NextResponse.json(
        { error: "This conversation has been closed" },
        { status: 400 }
      );
    }

    // Create the message (visitor messages only via this endpoint)
    const { data: message, error } = await supabase
      .from("sws2026_chat_messages")
      .insert({
        conversation_id,
        sender_type: "visitor",
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update conversation's last_message_at
    await supabase
      .from("sws2026_chat_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    return NextResponse.json({
      message: message as ChatMessage,
    });
  } catch (error) {
    console.error("Live chat message creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
