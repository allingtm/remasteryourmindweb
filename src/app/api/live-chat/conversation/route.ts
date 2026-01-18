import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ChatConversation } from "@/types/live-chat";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

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

interface CreateConversationBody {
  visitor_id: string;
  visitor_name?: string;
  visitor_email?: string;
  post_id?: string;
  source_url?: string;
  consent_given?: boolean;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(clientIP, "chatConversation", RATE_LIMITS.chatConversation);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body: CreateConversationBody = await request.json();
    const { visitor_id, visitor_name, visitor_email, post_id, source_url, consent_given } = body;

    if (!visitor_id) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    // Validate visitor_id is a valid UUID format
    if (!UUID_REGEX.test(visitor_id)) {
      return NextResponse.json(
        { error: "Invalid visitor_id format" },
        { status: 400 }
      );
    }

    // Validate name (max 30 chars)
    if (visitor_name && visitor_name.length > 30) {
      return NextResponse.json(
        { error: "Name must be 30 characters or less" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (visitor_email && !emailRegex.test(visitor_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
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
        console.log(`Blocked IP ${clientIP} attempted to start conversation`);
        return NextResponse.json(
          { error: "You are not allowed to start new conversations" },
          { status: 403 }
        );
      }
    }

    // Create the conversation - only store IP if consent was given
    const { data: conversation, error } = await supabase
      .from("sws2026_chat_conversations")
      .insert({
        visitor_id,
        visitor_name: visitor_name || null,
        visitor_email: visitor_email || null,
        post_id: post_id || null,
        source_url: source_url || null,
        visitor_ip: consent_given ? clientIP : null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch post title if post_id is provided
    let postTitle: string | undefined;
    if (post_id) {
      const { data: post } = await supabase
        .from("sws2026_blog_posts")
        .select("title")
        .eq("id", post_id)
        .single();
      postTitle = post?.title;
    }

    return NextResponse.json({
      conversation: conversation as ChatConversation,
      postTitle,
    });
  } catch (error) {
    console.error("Live chat conversation creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
