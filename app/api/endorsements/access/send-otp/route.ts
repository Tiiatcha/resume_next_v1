import configPromise from "@payload-config"
import { render } from "@react-email/components"
import { getPayload } from "payload"

import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIpAddress, getUserAgent } from "@/lib/http/request-metadata"
import {
  generateSixDigitOtp,
  hashOtpCode,
  normalizeEmailAddress,
} from "@/lib/endorsements/otp"
import { EndorsementOtpEmail } from "@/emails/endorsement-otp"

type SendOtpRequestBody = {
  endorsementId?: unknown
  email?: unknown
}

type SendOtpResponseBody =
  | { success: true }
  | { success: false; error: string }

function jsonResponse<TBody>(body: TBody, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

/**
 * Send an OTP to the email address on file for an endorsement.
 *
 * Important:
 * - Always returns a generic success response to avoid leaking whether the
 *   endorsement exists or whether the email matches.
 */
export async function POST(request: Request): Promise<Response> {
  const ipAddress = getClientIpAddress(request)
  const userAgent = getUserAgent(request)

  // Abuse prevention: limit OTP sends per IP.
  const ipLimit = checkRateLimit({
    identifier: `endorsement-otp-send:${ipAddress}`,
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  })

  if (!ipLimit.allowed) {
    // Still respond generically.
    const body: SendOtpResponseBody = { success: true }
    return jsonResponse(body, 200)
  }

  let payloadBody: SendOtpRequestBody
  try {
    payloadBody = (await request.json()) as SendOtpRequestBody
  } catch {
    const body: SendOtpResponseBody = { success: false, error: "Invalid JSON body." }
    return jsonResponse(body, 400)
  }

  const endorsementId =
    typeof payloadBody.endorsementId === "string" ? payloadBody.endorsementId.trim() : ""
  const emailRaw = typeof payloadBody.email === "string" ? payloadBody.email : ""
  const emailNormalized = emailRaw ? normalizeEmailAddress(emailRaw) : ""

  if (!endorsementId || !emailNormalized) {
    const body: SendOtpResponseBody = { success: false, error: "Endorsement ID and email are required." }
    return jsonResponse(body, 400)
  }

  // Abuse prevention: limit sends per endorsement/email pair.
  const pairLimit = checkRateLimit({
    identifier: `endorsement-otp-send:${endorsementId}:${emailNormalized}`,
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
  })
  if (!pairLimit.allowed) {
    const body: SendOtpResponseBody = { success: true }
    return jsonResponse(body, 200)
  }

  const payload = await getPayload({ config: configPromise })

  let endorsement: { id: string; endorserName: string; endorserEmail?: string | null } | null = null
  try {
    const doc = await payload.findByID({
      collection: "endorsements",
      id: endorsementId,
      overrideAccess: true,
    })

    endorsement = {
      id: doc.id,
      endorserName: doc.endorserName,
      endorserEmail: doc.endorserEmail,
    }
  } catch {
    // Intentionally ignore to avoid leaking existence.
    endorsement = null
  }

  const targetEmail = endorsement?.endorserEmail ? normalizeEmailAddress(endorsement.endorserEmail) : ""
  const emailsMatch = Boolean(targetEmail) && targetEmail === emailNormalized

  if (!endorsement || !emailsMatch) {
    const body: SendOtpResponseBody = { success: true }
    return jsonResponse(body, 200)
  }

  // Invalidate any previous active challenges so only the latest code can be used.
  // This prevents older email threads / previously sent codes from being replayed.
  try {
    const nowIso = new Date().toISOString()
    const activeChallenges = await payload.find({
      collection: "endorsement-access-challenges",
      overrideAccess: true,
      limit: 25,
      sort: "-createdAt",
      where: {
        endorsement: { equals: endorsement.id },
        emailNormalized: { equals: emailNormalized },
        usedAt: { exists: false },
        expiresAt: { greater_than: nowIso },
      },
    })

    await Promise.all(
      activeChallenges.docs.map((challenge) =>
        payload.update({
          collection: "endorsement-access-challenges",
          id: challenge.id,
          overrideAccess: true,
          data: {
            usedAt: nowIso,
          },
        }),
      ),
    )
  } catch (error) {
    payload.logger.warn(
      `Failed to invalidate previous endorsement OTP challenges: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  const otpCode = generateSixDigitOtp()
  const expiresInMinutes = 10
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  const otpHash = hashOtpCode({
    endorsementId: endorsement.id,
    emailNormalized,
    otp: otpCode,
  })

  try {
    await payload.create({
      collection: "endorsement-access-challenges",
      overrideAccess: true,
      data: {
        endorsement: endorsement.id,
        emailNormalized,
        otpHash,
        expiresAt: expiresAt.toISOString(),
        attemptCount: 0,
        lastSentAt: new Date().toISOString(),
        requestMeta: {
          ipAddress,
          userAgent,
        },
      },
    })
  } catch (error) {
    payload.logger.error(
      `Failed to create endorsement OTP challenge: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Still respond generically.
    const body: SendOtpResponseBody = { success: true }
    return jsonResponse(body, 200)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const manageUrl = `${baseUrl}/endorsements/view/${endorsement.id}`

  try {
    const html = await render(
      EndorsementOtpEmail({
        endorserName: endorsement.endorserName,
        otpCode,
        expiresInMinutes,
        manageUrl,
      }),
    )

    await payload.sendEmail({
      to: endorsement.endorserEmail ?? "",
      subject: "Your endorsement verification code",
      html,
    })
  } catch (error) {
    payload.logger.error(
      `Failed to send endorsement OTP email: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  const body: SendOtpResponseBody = { success: true }
  return jsonResponse(body, 200)
}

