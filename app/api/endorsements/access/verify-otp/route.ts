import configPromise from "@payload-config"
import { getPayload } from "payload"

import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIpAddress } from "@/lib/http/request-metadata"
import {
  normalizeEmailAddress,
  hashOtpCode,
  safeTimingEqual,
} from "@/lib/endorsements/otp"
import {
  ENDORSEMENT_ACCESS_COOKIE_NAME,
  buildEndorsementAccessCookieOptions,
  createEndorsementAccessToken,
} from "@/lib/endorsements/access-session"

type VerifyOtpRequestBody = {
  endorsementId?: unknown
  email?: unknown
  otp?: unknown
}

type VerifyOtpResponseBody =
  | { success: true }
  | { success: false; error: string }

function jsonResponse<TBody>(body: TBody, status: number, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  })
}

function buildSetCookieHeader(params: Readonly<{ name: string; value: string; maxAgeSeconds: number }>): string {
  const options = buildEndorsementAccessCookieOptions()
  const parts = [
    `${params.name}=${encodeURIComponent(params.value)}`,
    `Max-Age=${params.maxAgeSeconds}`,
    `Path=${options.path}`,
    "HttpOnly",
    `SameSite=${options.sameSite}`,
  ]

  if (options.secure) {
    parts.push("Secure")
  }

  return parts.join("; ")
}

export async function POST(request: Request): Promise<Response> {
  const ipAddress = getClientIpAddress(request)

  const ipLimit = checkRateLimit({
    identifier: `endorsement-otp-verify:${ipAddress}`,
    windowMs: 15 * 60 * 1000,
    maxRequests: 30,
  })
  if (!ipLimit.allowed) {
    const body: VerifyOtpResponseBody = { success: false, error: "Too many attempts. Please try again later." }
    return jsonResponse(body, 429)
  }

  let payloadBody: VerifyOtpRequestBody
  try {
    payloadBody = (await request.json()) as VerifyOtpRequestBody
  } catch {
    const body: VerifyOtpResponseBody = { success: false, error: "Invalid JSON body." }
    return jsonResponse(body, 400)
  }

  const endorsementId =
    typeof payloadBody.endorsementId === "string" ? payloadBody.endorsementId.trim() : ""
  const emailRaw = typeof payloadBody.email === "string" ? payloadBody.email : ""
  const emailNormalized = emailRaw ? normalizeEmailAddress(emailRaw) : ""
  const otp = typeof payloadBody.otp === "string" ? payloadBody.otp.trim() : ""

  const otpPattern = /^\d{6}$/
  if (!endorsementId || !emailNormalized || !otpPattern.test(otp)) {
    const body: VerifyOtpResponseBody = { success: false, error: "Please enter the 6-digit code sent to your email." }
    return jsonResponse(body, 400)
  }

  const pairLimit = checkRateLimit({
    identifier: `endorsement-otp-verify:${endorsementId}:${emailNormalized}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 12,
  })
  if (!pairLimit.allowed) {
    const body: VerifyOtpResponseBody = { success: false, error: "Too many attempts. Please try again later." }
    return jsonResponse(body, 429)
  }

  const payload = await getPayload({ config: configPromise })

  const now = new Date()
  const nowIso = now.toISOString()

  const challengeResult = await payload.find({
    collection: "endorsement-access-challenges",
    overrideAccess: true,
    limit: 1,
    sort: "-createdAt",
    where: {
      endorsement: { equals: endorsementId },
      emailNormalized: { equals: emailNormalized },
      usedAt: { exists: false },
      expiresAt: { greater_than: nowIso },
    },
  })

  const challenge = challengeResult.docs[0]
  if (!challenge) {
    const body: VerifyOtpResponseBody = { success: false, error: "That code is invalid or has expired. Please request a new one." }
    return jsonResponse(body, 400)
  }

  const lockedUntil = typeof challenge.lockedUntil === "string" ? challenge.lockedUntil : null
  if (lockedUntil && new Date(lockedUntil).getTime() > Date.now()) {
    const body: VerifyOtpResponseBody = { success: false, error: "Too many attempts. Please wait and try again." }
    return jsonResponse(body, 429)
  }

  const candidateHash = hashOtpCode({
    endorsementId,
    emailNormalized,
    otp,
  })

  const hashMatches = safeTimingEqual(candidateHash, challenge.otpHash)

  if (!hashMatches) {
    const previousAttempts = typeof challenge.attemptCount === "number" ? challenge.attemptCount : 0
    const nextAttempts = previousAttempts + 1

    const shouldLock = nextAttempts >= 5
    const lockUntilIso = shouldLock
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null

    await payload.update({
      collection: "endorsement-access-challenges",
      id: challenge.id,
      overrideAccess: true,
      data: {
        attemptCount: nextAttempts,
        lockedUntil: lockUntilIso,
      },
    })

    const body: VerifyOtpResponseBody = { success: false, error: "That code is invalid or has expired. Please try again." }
    return jsonResponse(body, 400)
  }

  await payload.update({
    collection: "endorsement-access-challenges",
    id: challenge.id,
    overrideAccess: true,
    data: {
      usedAt: nowIso,
    },
  })

  // Mint a short-lived "manage session" cookie scoped to this endorsement.
  const sessionLifetimeMinutes = 30
  const token = createEndorsementAccessToken({
    endorsementId,
    emailNormalized,
    expiresAtMs: Date.now() + sessionLifetimeMinutes * 60 * 1000,
  })

  const setCookieHeader = buildSetCookieHeader({
    name: ENDORSEMENT_ACCESS_COOKIE_NAME,
    value: token,
    maxAgeSeconds: sessionLifetimeMinutes * 60,
  })

  const body: VerifyOtpResponseBody = { success: true }
  return jsonResponse(body, 200, {
    "Set-Cookie": setCookieHeader,
  })
}

