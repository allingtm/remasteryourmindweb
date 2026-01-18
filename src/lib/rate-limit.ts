/**
 * Rate limiter using Upstash Redis for serverless environments
 * Provides persistent, shared rate limiting across all function instances
 */

import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// or KV_REST_API_URL and KV_REST_API_TOKEN
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

/**
 * Check if a request should be rate limited using Redis
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param endpoint - Endpoint name for namespacing
 * @param config - Rate limit configuration
 * @returns Promise<RateLimitResult> with success status and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${endpoint}:${identifier}`;
  const now = Date.now();

  try {
    // Increment the counter atomically
    const count = await redis.incr(key);

    if (count === 1) {
      // First request in this window - set the expiry
      await redis.expire(key, config.windowSeconds);
    }

    // Get TTL to calculate reset time
    const ttl = await redis.ttl(key);
    const resetTime = now + (ttl > 0 ? ttl * 1000 : config.windowSeconds * 1000);

    if (count > config.limit) {
      return {
        success: false,
        remaining: 0,
        resetTime,
      };
    }

    return {
      success: true,
      remaining: config.limit - count,
      resetTime,
    };
  } catch (error) {
    // If Redis fails, allow the request (fail open) but log the error
    console.error("Rate limit check failed:", error);
    return {
      success: true,
      remaining: config.limit,
      resetTime: now + config.windowSeconds * 1000,
    };
  }
}

/**
 * Get the client IP address from request headers
 * Handles common proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Vercel-specific header
  const vercelForwarded = request.headers.get("x-real-ip");
  if (vercelForwarded) {
    return vercelForwarded;
  }

  // Cloudflare header
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - should not happen in production with proper proxy setup
  return "unknown";
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(retryAfter, 1)),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetTime),
      },
    }
  );
}

// Pre-configured rate limits for common endpoints
export const RATE_LIMITS = {
  enquiry: { limit: 1, windowSeconds: 600 },          // 1 per 10 minutes
  chatConversation: { limit: 4, windowSeconds: 60 },  // 4 per minute
  chatMessage: { limit: 20, windowSeconds: 60 },      // 20 per minute
  chatCheckBlocked: { limit: 10, windowSeconds: 60 }, // 10 per minute
} as const;
