import crypto from "node:crypto"

/**
 * Normalize an email address for comparisons.
 *
 * Notes:
 * - We only do a lightweight normalization (trim + lowercase).
 * - We intentionally do NOT do provider-specific normalizations (like Gmail dots)
 *   to avoid surprising users.
 */
export function normalizeEmailAddress(input: string): string {
  return input.trim().toLowerCase()
}

/**
 * Generate a 6-digit numeric OTP as a string.
 */
export function generateSixDigitOtp(): string {
  const n = crypto.randomInt(0, 1_000_000)
  return String(n).padStart(6, "0")
}

function getOtpPepper(): string {
  const pepper =
    process.env.ENDORSEMENT_OTP_PEPPER?.trim() ||
    process.env.PAYLOAD_SECRET?.trim() ||
    ""

  if (process.env.NODE_ENV === "production" && !pepper) {
    throw new Error(
      "ENDORSEMENT_OTP_PEPPER (or PAYLOAD_SECRET) must be configured in production.",
    )
  }

  return pepper
}

/**
 * Hash an OTP so the raw code is never stored.
 *
 * The hash is bound to:
 * - endorsementId
 * - emailNormalized
 * - the OTP code
 * - a server-side secret "pepper"
 */
export function hashOtpCode(params: Readonly<{
  endorsementId: string
  emailNormalized: string
  otp: string
}>): string {
  const pepper = getOtpPepper()
  const input = `${params.endorsementId}:${params.emailNormalized}:${params.otp}:${pepper}`
  return crypto.createHash("sha256").update(input).digest("hex")
}

export function safeTimingEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"))
}

