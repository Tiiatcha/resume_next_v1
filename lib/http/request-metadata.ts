/**
 * Extract request metadata in a consistent way.
 *
 * These utilities are used for rate limiting and basic abuse prevention.
 */

export function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp

  return "unknown"
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") ?? ""
}

