/**
 * Simple in-memory rate limiter for Supabase Edge Functions.
 * Uses a sliding window approach with configurable limits.
 * 
 * NOTE: This is per-isolate (not distributed). For production-grade
 * rate limiting, use Redis or a DB-backed approach.
 */

const requestLog = new Map<string, number[]>();

const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, timestamps] of requestLog.entries()) {
    const filtered = timestamps.filter(t => t > cutoff);
    if (filtered.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, filtered);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g. user ID or IP)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = requestLog.get(key) || [];
  const recent = timestamps.filter(t => t > cutoff);

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  recent.push(now);
  requestLog.set(key, recent);

  return { allowed: true, remaining: maxRequests - recent.length };
}

/**
 * Returns a 429 Too Many Requests response.
 */
export function rateLimitResponse(retryAfterMs: number = 60_000): Response {
  const retryAfterSec = Math.ceil(retryAfterMs / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    }
  );
}
