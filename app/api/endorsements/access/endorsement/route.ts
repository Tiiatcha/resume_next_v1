import configPromise from "@payload-config"
import { getPayload } from "payload"

import { getClientIpAddress } from "@/lib/http/request-metadata"
import { checkRateLimit } from "@/lib/rate-limit"
import { normalizeEmailAddress } from "@/lib/endorsements/otp"
import {
  ENDORSEMENT_ACCESS_COOKIE_NAME,
  readEndorsementAccessSessionFromCookieHeader,
  buildEndorsementAccessCookieOptions,
} from "@/lib/endorsements/access-session"

type RelationshipType =
  | "client"
  | "colleague"
  | "manager"
  | "directReport"
  | "other"

type UpdateEndorsementRequestBody = {
  endorserName?: unknown
  relationshipType?: unknown
  roleOrTitle?: unknown
  companyOrProject?: unknown
  linkedinUrl?: unknown
  endorsementText?: unknown
  displayPreferences?: unknown
}

type ApiResponseBody =
  | { success: true }
  | { success: false; errors: string[] }

function jsonResponse<TBody>(body: TBody, status: number, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  })
}

function buildClearCookieHeader(): string {
  const options = buildEndorsementAccessCookieOptions()
  const parts = [
    `${ENDORSEMENT_ACCESS_COOKIE_NAME}=`,
    "Max-Age=0",
    `Path=${options.path}`,
    "HttpOnly",
    `SameSite=${options.sameSite}`,
  ]

  if (options.secure) {
    parts.push("Secure")
  }

  return parts.join("; ")
}

function validateRelationshipType(value: unknown): value is RelationshipType {
  return (
    value === "client" ||
    value === "colleague" ||
    value === "manager" ||
    value === "directReport" ||
    value === "other"
  )
}

function validateUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Update the endorsement referenced by the verified session cookie.
 *
 * Security rules:
 * - Requires a valid endorsement-manage session cookie.
 * - Requires the email in the session to match the endorsement's stored email.
 * - Only allows updating a safe subset of fields (no status changes by submitter).
 * - Resets `status` to `pending` to force re-review after changes.
 */
export async function PATCH(request: Request): Promise<Response> {
  const ipAddress = getClientIpAddress(request)

  const rateLimit = checkRateLimit({
    identifier: `endorsement-access-update:${ipAddress}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  })
  if (!rateLimit.allowed) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["Too many requests. Please try again later."],
    }
    return jsonResponse(body, 429)
  }

  const session = readEndorsementAccessSessionFromCookieHeader(request.headers.get("cookie"))
  if (!session) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["You must verify your email before editing this endorsement."],
    }
    return jsonResponse(body, 401)
  }

  let payloadBody: UpdateEndorsementRequestBody
  try {
    payloadBody = (await request.json()) as UpdateEndorsementRequestBody
  } catch {
    const body: ApiResponseBody = { success: false, errors: ["Invalid JSON body."] }
    return jsonResponse(body, 400)
  }

  const errors: string[] = []

  const endorserName = typeof payloadBody.endorserName === "string" ? payloadBody.endorserName.trim() : ""
  if (!endorserName) {
    errors.push("Name is required.")
  } else if (endorserName.length > 200) {
    errors.push("Name must be 200 characters or fewer.")
  }

  const endorsementText =
    typeof payloadBody.endorsementText === "string" ? payloadBody.endorsementText.trim() : ""
  if (!endorsementText) {
    errors.push("Endorsement text is required.")
  } else if (endorsementText.length < 40) {
    errors.push("Endorsement should be at least 40 characters so it has enough context to be useful.")
  } else if (endorsementText.length > 500) {
    errors.push("Endorsement should be 500 characters or fewer.")
  }

  const relationshipType = payloadBody.relationshipType
  if (!validateRelationshipType(relationshipType)) {
    errors.push("Relationship is required and must be one of the provided options.")
  }

  const roleOrTitle =
    typeof payloadBody.roleOrTitle === "string" ? payloadBody.roleOrTitle.trim() : undefined
  const companyOrProject =
    typeof payloadBody.companyOrProject === "string" ? payloadBody.companyOrProject.trim() : undefined

  const linkedinUrl =
    typeof payloadBody.linkedinUrl === "string" ? payloadBody.linkedinUrl.trim() : undefined
  if (linkedinUrl && linkedinUrl.length > 0 && !validateUrl(linkedinUrl)) {
    errors.push("Please provide a valid LinkedIn profile URL (including https://) or leave this field blank.")
  }

  const displayPreferencesRaw = payloadBody.displayPreferences
  const displayPreferences =
    displayPreferencesRaw && typeof displayPreferencesRaw === "object"
      ? (displayPreferencesRaw as {
          showNamePublicly?: unknown
          showCompanyOrProjectPublicly?: unknown
          showLinkedinUrlPublicly?: unknown
        })
      : {}

  if (errors.length > 0) {
    const body: ApiResponseBody = { success: false, errors }
    return jsonResponse(body, 400)
  }

  const payload = await getPayload({ config: configPromise })

  let endorsement: { id: string; endorserEmail?: string | null } | null = null
  try {
    const doc = await payload.findByID({
      collection: "endorsements",
      id: session.endorsementId,
      overrideAccess: true,
    })

    endorsement = {
      id: doc.id,
      endorserEmail: doc.endorserEmail,
    }
  } catch {
    endorsement = null
  }

  if (!endorsement || !endorsement.endorserEmail) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["We could not verify access for this endorsement. Please request a new code."],
    }
    return jsonResponse(body, 401, { "Set-Cookie": buildClearCookieHeader() })
  }

  const normalizedDocEmail = normalizeEmailAddress(endorsement.endorserEmail)
  if (normalizedDocEmail !== session.emailNormalized) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["We could not verify access for this endorsement. Please request a new code."],
    }
    return jsonResponse(body, 401, { "Set-Cookie": buildClearCookieHeader() })
  }

  await payload.update({
    collection: "endorsements",
    id: endorsement.id,
    overrideAccess: true,
    data: {
      endorserName,
      endorsementText,
      relationshipType,
      roleOrTitle: roleOrTitle || undefined,
      companyOrProject: companyOrProject || undefined,
      linkedinUrl: linkedinUrl || undefined,
      displayPreferences: {
        showNamePublicly: Boolean(displayPreferences.showNamePublicly ?? true),
        showCompanyOrProjectPublicly: Boolean(displayPreferences.showCompanyOrProjectPublicly ?? true),
        showLinkedinUrlPublicly: Boolean(displayPreferences.showLinkedinUrlPublicly ?? false),
      },
      // Force a re-review after submitter changes.
      status: "pending",
      approvedAt: null,
      submitterEditAt: new Date().toISOString(),
      reviewRequest: {
        type: "submitter_edit",
        requestedBy: "submitter",
        requestedAt: new Date().toISOString(),
      },
    },
  })

  const body: ApiResponseBody = { success: true }
  return jsonResponse(body, 200)
}

/**
 * Delete the endorsement referenced by the verified session cookie.
 *
 * This clears the session cookie after deleting.
 */
export async function DELETE(request: Request): Promise<Response> {
  const ipAddress = getClientIpAddress(request)

  const rateLimit = checkRateLimit({
    identifier: `endorsement-access-delete:${ipAddress}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
  })
  if (!rateLimit.allowed) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["Too many requests. Please try again later."],
    }
    return jsonResponse(body, 429)
  }

  const session = readEndorsementAccessSessionFromCookieHeader(request.headers.get("cookie"))
  if (!session) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["You must verify your email before deleting this endorsement."],
    }
    return jsonResponse(body, 401)
  }

  const payload = await getPayload({ config: configPromise })

  let endorsement: { id: string; endorserEmail?: string | null } | null = null
  try {
    const doc = await payload.findByID({
      collection: "endorsements",
      id: session.endorsementId,
      overrideAccess: true,
    })

    endorsement = {
      id: doc.id,
      endorserEmail: doc.endorserEmail,
    }
  } catch {
    endorsement = null
  }

  if (!endorsement || !endorsement.endorserEmail) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["We could not verify access for this endorsement. Please request a new code."],
    }
    return jsonResponse(body, 401, { "Set-Cookie": buildClearCookieHeader() })
  }

  const normalizedDocEmail = normalizeEmailAddress(endorsement.endorserEmail)
  if (normalizedDocEmail !== session.emailNormalized) {
    const body: ApiResponseBody = {
      success: false,
      errors: ["We could not verify access for this endorsement. Please request a new code."],
    }
    return jsonResponse(body, 401, { "Set-Cookie": buildClearCookieHeader() })
  }

  await payload.delete({
    collection: "endorsements",
    id: endorsement.id,
    overrideAccess: true,
  })

  const body: ApiResponseBody = { success: true }
  return jsonResponse(body, 200, { "Set-Cookie": buildClearCookieHeader() })
}

