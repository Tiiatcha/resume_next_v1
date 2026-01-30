import crypto from "node:crypto"

/**
 * Cookie name used to store the short-lived, endorsement-scoped "manage session".
 *
 * This cookie is only set after a successful OTP verification.
 */
export const ENDORSEMENT_ACCESS_COOKIE_NAME = "endorsement_manage_session"

/**
 * Payload stored in the signed session cookie.
 *
 * Important:
 * - This is **not** a general auth system. It only authorizes edit/delete for one endorsement.
 * - The cookie is HttpOnly, so it can't be read by client-side JavaScript.
 */
export type EndorsementAccessSessionPayload = Readonly<{
  endorsementId: string
  emailNormalized: string
  /**
   * Expiry time (unix epoch milliseconds).
   */
  expiresAtMs: number
}>

function getAccessSecret(): string {
  // Prefer a dedicated secret, but fall back to PAYLOAD_SECRET to reduce setup friction.
  // In production, you should set ENDORSEMENT_ACCESS_SECRET explicitly.
  const secret =
    process.env.ENDORSEMENT_ACCESS_SECRET?.trim() ||
    process.env.PAYLOAD_SECRET?.trim() ||
    ""

  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error(
      "ENDORSEMENT_ACCESS_SECRET (or PAYLOAD_SECRET) must be configured in production.",
    )
  }

  return secret
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8")
  return buffer.toString("base64url")
}

function base64UrlDecodeToString(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8")
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url")
}

/**
 * Create a signed token suitable for storage in a cookie.
 *
 * Format:
 * - `<base64url(json)>.<base64url(hmac)>`
 */
export function createEndorsementAccessToken(
  payload: EndorsementAccessSessionPayload,
): string {
  const secret = getAccessSecret()
  const json = JSON.stringify(payload)
  const body = base64UrlEncode(json)
  const signature = sign(body, secret)
  return `${body}.${signature}`
}

/**
 * Verify a signed token and return the parsed payload if valid.
 */
export function verifyEndorsementAccessToken(
  token: string,
): EndorsementAccessSessionPayload | null {
  const secret = getAccessSecret()

  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  const expectedSignature = sign(body, secret)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  // Timing-safe compare to reduce signature oracle risk.
  // `timingSafeEqual` requires buffers of the same length.
  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return null
  }

  const signatureMatches = crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  if (!signatureMatches) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(base64UrlDecodeToString(body))
  } catch {
    return null
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("endorsementId" in parsed) ||
    !("emailNormalized" in parsed) ||
    !("expiresAtMs" in parsed)
  ) {
    return null
  }

  const { endorsementId, emailNormalized, expiresAtMs } = parsed as {
    endorsementId?: unknown
    emailNormalized?: unknown
    expiresAtMs?: unknown
  }

  if (typeof endorsementId !== "string" || endorsementId.trim().length === 0) {
    return null
  }

  if (typeof emailNormalized !== "string" || emailNormalized.trim().length === 0) {
    return null
  }

  if (typeof expiresAtMs !== "number" || !Number.isFinite(expiresAtMs)) {
    return null
  }

  if (Date.now() > expiresAtMs) {
    return null
  }

  return {
    endorsementId,
    emailNormalized,
    expiresAtMs,
  }
}

/**
 * Read and verify the endorsement access session from a raw Cookie header string.
 *
 * This is used by both route handlers and server components.
 */
export function readEndorsementAccessSessionFromCookieHeader(
  cookieHeader: string | null,
): EndorsementAccessSessionPayload | null {
  if (!cookieHeader) return null

  const cookiePairs = cookieHeader.split(";").map((part) => part.trim())
  const target = cookiePairs.find((pair) => pair.startsWith(`${ENDORSEMENT_ACCESS_COOKIE_NAME}=`))
  if (!target) return null

  const value = target.slice(`${ENDORSEMENT_ACCESS_COOKIE_NAME}=`.length)
  if (!value) return null

  const decoded = decodeURIComponent(value)
  return verifyEndorsementAccessToken(decoded)
}

export function buildEndorsementAccessCookieOptions(): {
  httpOnly: true
  secure: boolean
  sameSite: "lax"
  path: string
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  }
}

