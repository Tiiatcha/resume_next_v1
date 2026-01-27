/**
 * Simple in-memory rate limiter for Next.js route handlers.
 *
 * Notes:
 * - This is process-local. In a serverless / multi-instance environment, each
 *   instance maintains its own counters. For this personal CV site that is
 *   acceptable and keeps the implementation lightweight.
 * - We key buckets by an arbitrary identifier (typically an IP address plus a
 *   logical scope string) so different features can share the same limiter.
 */

export interface RateLimitOptions {
  /**
   * Unique identifier for the caller, for example an IP address or a hash of
   * IP + user agent + feature name.
   */
  identifier: string
  /**
   * Size of the time window in milliseconds (for example, 86_400_000 for 24 hours).
   */
  windowMs: number
  /**
   * Maximum number of allowed requests within the time window.
   */
  maxRequests: number
}

export interface RateLimitResultAllowed {
  allowed: true
}

export interface RateLimitResultBlocked {
  allowed: false
  /**
   * Milliseconds until the current window resets and requests are allowed again.
   */
  retryAfterMs: number
}

export type RateLimitResult = RateLimitResultAllowed | RateLimitResultBlocked

interface RateLimitBucket {
  count: number
  firstRequestTimestamp: number
}

// Process-local storage for rate limit buckets.
const rateLimitBuckets = new Map<string, RateLimitBucket>()

/**
 * Check whether a request is allowed under the current rate limit settings.
 *
 * This implements a fixed window counter:
 * - The first request starts a window.
 * - Requests within the same window increment the counter.
 * - Once the counter exceeds `maxRequests`, further requests are blocked until the window resets.
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { identifier, windowMs, maxRequests } = options

  const now = Date.now()
  const existingBucket = rateLimitBuckets.get(identifier)

  if (!existingBucket) {
    rateLimitBuckets.set(identifier, {
      count: 1,
      firstRequestTimestamp: now,
    })
    return { allowed: true }
  }

  const elapsed = now - existingBucket.firstRequestTimestamp

  if (elapsed > windowMs) {
    // Window has expired; start a new one.
    rateLimitBuckets.set(identifier, {
      count: 1,
      firstRequestTimestamp: now,
    })
    return { allowed: true }
  }

  if (existingBucket.count < maxRequests) {
    existingBucket.count += 1
    return { allowed: true }
  }

  const retryAfterMs = windowMs - elapsed
  return {
    allowed: false,
    retryAfterMs,
  }
}

