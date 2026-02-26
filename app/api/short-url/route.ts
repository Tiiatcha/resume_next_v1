import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { getSiteSettings } from "@/lib/seo/get-site-settings"
import { customAlphabet } from "nanoid"

/** URL-safe alphabet (no ambiguous chars). Length 8 gives ~2M years at 1k creates/sec before 50% collision. */
const generateShortCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8
)

/** Allowed path prefix for short links. Prevents open redirect and abuse. */
const ALLOWED_PATH_PREFIX = "/blog/"

/** Matches a single segment after /blog/ (e.g. /blog/my-post-slug). No trailing slash or extra path. */
const BLOG_PATH_REGEX = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/i

type ShortLinkDocument = {
  shortCode: string
  targetPath: string
}

interface ShortUrlSuccessBody {
  shortCode: string
  shortUrl: string
}

interface ShortUrlErrorBody {
  error: string
}

function jsonResponse(body: ShortUrlSuccessBody | ShortUrlErrorBody, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * POST /api/short-url
 * Body: { path: string } (e.g. "/blog/my-post-slug")
 * Returns: { shortCode, shortUrl } or { error } with 400/500.
 * Only paths under /blog/ are accepted.
 */
export async function POST(request: Request): Promise<Response> {
  let body: { path?: unknown }
  try {
    body = (await request.json()) as { path?: unknown }
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400)
  }

  const path = typeof body.path === "string" ? body.path.trim() : ""
  if (!path) {
    return jsonResponse({ error: "Missing or empty path." }, 400)
  }

  if (!path.startsWith(ALLOWED_PATH_PREFIX)) {
    return jsonResponse(
      { error: "Only blog post paths are allowed (e.g. /blog/post-slug)." },
      400
    )
  }

  if (!BLOG_PATH_REGEX.test(path)) {
    return jsonResponse(
      { error: "Invalid blog path format. Use a single slug after /blog/." },
      400
    )
  }

  try {
    const [payload, siteSettings] = await Promise.all([
      getPayloadClient(),
      getSiteSettings(),
    ])

    const existing = await payload.find({
      collection: "short-links",
      depth: 0,
      limit: 1,
      where: { targetPath: { equals: path } },
    })

    const docs = existing.docs as unknown as ShortLinkDocument[]
    if (docs.length > 0) {
      const doc = docs[0]
      const shortUrl = `${siteSettings.siteUrl.replace(/\/$/, "")}/s/${doc.shortCode}`
      return jsonResponse({ shortCode: doc.shortCode, shortUrl }, 200)
    }

    let shortCode = generateShortCode()
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await payload.create({
          collection: "short-links",
          data: { shortCode, targetPath: path },
        })
        break
      } catch (createError) {
        const isDuplicate =
          createError && typeof createError === "object" && "code" in createError && (createError as { code?: number }).code === 11000
        if (isDuplicate && attempt < maxAttempts - 1) {
          shortCode = generateShortCode()
          continue
        }
        throw createError
      }
    }

    const shortUrl = `${siteSettings.siteUrl.replace(/\/$/, "")}/s/${shortCode}`
    return jsonResponse({ shortCode, shortUrl }, 200)
  } catch (error) {
    return jsonResponse(
      { error: "Failed to create or fetch short link. Please try again." },
      500
    )
  }
}
