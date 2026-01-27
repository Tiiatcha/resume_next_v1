import configPromise from "@payload-config"
import { getPayload } from "payload"

import { checkRateLimit } from "@/lib/rate-limit"

type RelationshipType =
  | "client"
  | "colleague"
  | "manager"
  | "directReport"
  | "other"

type IncomingEndorsementPayload = {
  name?: string
  email?: string
  endorsementText?: string
  relationshipType?: RelationshipType | string
  companyOrProject?: string
  roleOrTitle?: string
  linkedinUrl?: string
  displayNamePublic?: boolean
  displayCompanyPublic?: boolean
  displayLinkedInPublic?: boolean
  consentToPublish?: boolean
  /**
   * Honeypot field – should be left empty by real users.
   * Bots that indiscriminately fill every field will typically populate this.
   */
  honeypot?: string
}

interface ErrorResponseBody {
  success: false
  errors: string[]
}

interface SuccessResponseBody {
  success: true
}

function jsonResponse<TBody>(
  body: TBody,
  status: number,
  headers?: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  })
}

function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp

  return "unknown"
}

export async function POST(request: Request): Promise<Response> {
  const ipAddress = getClientIpAddress(request)

  const isProduction = process.env.NODE_ENV === "production"

  if (isProduction) {
    // Basic in-memory rate limiting to prevent abuse of the public endpoint.
    const rateLimitResult = checkRateLimit({
      identifier: `endorsement:${ipAddress}`,
      // Allow up to 3 submissions per 24 hours from a single IP address.
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 3,
    })

    if (!rateLimitResult.allowed) {
      const retrySeconds = Math.ceil(rateLimitResult.retryAfterMs / 1000)
      const body: ErrorResponseBody = {
        success: false,
        errors: [
          "You have reached the submission limit for today. Please try again later or contact Craig directly if you need help.",
        ],
      }

      return jsonResponse(body, 429, {
        "Retry-After": String(retrySeconds),
      })
    }
  }

  let payloadBody: IncomingEndorsementPayload

  try {
    payloadBody = (await request.json()) as IncomingEndorsementPayload
  } catch {
    const body: ErrorResponseBody = {
      success: false,
      errors: ["Invalid request body. Expected JSON."],
    }
    return jsonResponse(body, 400)
  }

  // Honeypot check – if this field is filled, silently accept the request but skip creating a record.
  if (typeof payloadBody.honeypot === "string" && payloadBody.honeypot.trim().length > 0) {
    const body: SuccessResponseBody = {
      success: true,
    }
    return jsonResponse(body, 200)
  }

  const errors: string[] = []

  const name = typeof payloadBody.name === "string" ? payloadBody.name.trim() : ""
  if (!name) {
    errors.push("Name is required.")
  } else if (name.length > 200) {
    errors.push("Name must be 200 characters or fewer.")
  }

  const endorsementText =
    typeof payloadBody.endorsementText === "string"
      ? payloadBody.endorsementText.trim()
      : ""
  if (!endorsementText) {
    errors.push("Endorsement text is required.")
  } else if (endorsementText.length < 40) {
    errors.push("Endorsement should be at least 40 characters so it has enough context to be useful.")
  } else if (endorsementText.length > 500) {
    errors.push("Endorsement should be 500 characters or fewer.")
  }

  const relationshipTypeRaw =
    typeof payloadBody.relationshipType === "string"
      ? (payloadBody.relationshipType as string)
      : ""

  const allowedRelationshipTypes: RelationshipType[] = [
    "client",
    "colleague",
    "manager",
    "directReport",
    "other",
  ]

  const relationshipTypeLower = relationshipTypeRaw.toLowerCase() as RelationshipType
  const isRelationshipValid = allowedRelationshipTypes.includes(relationshipTypeLower)

  if (!isRelationshipValid) {
    errors.push("Relationship is required and must be one of the provided options.")
  }

  const email =
    typeof payloadBody.email === "string" ? payloadBody.email.trim() : undefined
  if (email && email.length > 0) {
    // Very lightweight email format check – we only care about catching obvious mistakes.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      errors.push("Please provide a valid email address or leave the email field blank.")
    }
  }

  const linkedinUrl =
    typeof payloadBody.linkedinUrl === "string"
      ? payloadBody.linkedinUrl.trim()
      : undefined
  if (linkedinUrl && linkedinUrl.length > 0) {
    // Lightweight URL check. We only require a scheme and at least one dot.
    const hasValidPrefix =
      linkedinUrl.startsWith("http://") || linkedinUrl.startsWith("https://")
    const containsDot = linkedinUrl.includes(".")
    if (!hasValidPrefix || !containsDot) {
      errors.push("Please provide a valid LinkedIn profile URL (including https://) or leave this field blank.")
    }
  }

  const consentToPublish = payloadBody.consentToPublish === true
  if (!consentToPublish) {
    errors.push("You must consent to your endorsement being stored and published in order to submit it.")
  }

  if (errors.length > 0) {
    const body: ErrorResponseBody = {
      success: false,
      errors,
    }
    return jsonResponse(body, 400)
  }

  const displayNamePublic = payloadBody.displayNamePublic ?? true
  const displayCompanyPublic = payloadBody.displayCompanyPublic ?? true
  const displayLinkedInPublic = payloadBody.displayLinkedInPublic ?? false

  const companyOrProject =
    typeof payloadBody.companyOrProject === "string"
      ? payloadBody.companyOrProject.trim()
      : undefined
  const roleOrTitle =
    typeof payloadBody.roleOrTitle === "string"
      ? payloadBody.roleOrTitle.trim()
      : undefined

  const userAgent = request.headers.get("user-agent") ?? ""

  const payload = await getPayload({
    config: configPromise,
  })

  // TODO: When you are ready, you can add an additional verification step here
  // (for example, reCAPTCHA or Cloudflare Turnstile) before creating the record.

  await payload.create({
    collection: "endorsements",
    overrideAccess: true,
    data: {
      endorserName: name,
      endorserEmail: email,
      endorsementText,
      relationshipType: relationshipTypeLower,
      roleOrTitle,
      companyOrProject,
      linkedinUrl,
      status: "pending",
      consentToPublish: true,
      displayPreferences: {
        showNamePublicly: displayNamePublic,
        showCompanyOrProjectPublicly: displayCompanyPublic,
        showLinkedinUrlPublicly: displayLinkedInPublic,
      },
      submissionMeta: {
        ipAddress,
        userAgent,
      },
    },
  })

  const body: SuccessResponseBody = {
    success: true,
  }

  return jsonResponse(body, 201)
}

