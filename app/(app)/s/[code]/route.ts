import { NextResponse } from "next/server"

import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { getSiteSettings } from "@/lib/seo/get-site-settings"

type ShortLinkDocument = {
  shortCode: string
  targetPath: string
}

/**
 * GET /s/[code] — Redirect short links to the stored target path.
 * Uses only the stored targetPath; no user input is used as the redirect destination.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
): Promise<Response> {
  const { code } = await context.params
  const shortCode = code?.trim()

  if (!shortCode) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "short-links",
      depth: 0,
      limit: 1,
      where: { shortCode: { equals: shortCode } },
    })

    const docs = result.docs as unknown as ShortLinkDocument[]
    if (docs.length === 0) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const targetPath = docs[0].targetPath
    const siteSettings = await getSiteSettings()
    const baseUrl = siteSettings.siteUrl.replace(/\/$/, "")
    const destination = `${baseUrl}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`

    return NextResponse.redirect(destination, 302)
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }
}
