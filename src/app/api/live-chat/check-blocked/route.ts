import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// Public endpoint for visitors to check if their IP is blocked
export async function GET(request: Request) {
  try {
    const clientIP = getClientIP(request);

    // Rate limiting check
    const rateLimit = await checkRateLimit(clientIP, "chatCheckBlocked", RATE_LIMITS.chatCheckBlocked);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // Skip check for localhost (development)
    if (!clientIP || clientIP === "::1" || clientIP === "127.0.0.1") {
      return NextResponse.json({ blocked: false });
    }

    const serviceClient = createServiceClient();

    const { data: blockedIP, error } = await serviceClient
      .from("sws2026_blocked_ips")
      .select("id")
      .eq("ip_address", clientIP)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected for non-blocked IPs
      console.error("Error checking blocked IP:", error);
      // Don't expose error details to visitors
      return NextResponse.json({ blocked: false });
    }

    return NextResponse.json({ blocked: !!blockedIP });
  } catch (error) {
    console.error("Check blocked error:", error);
    // On error, allow access (fail open for better UX, but log the issue)
    return NextResponse.json({ blocked: false });
  }
}
