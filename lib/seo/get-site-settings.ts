import { cache } from "react"

import { getPayloadClient } from "@/lib/payload/get-payload-client"
import type { Media } from "@/payload-types"

type SiteSettingsGlobal = {
  siteName?: string | null
  siteUrl?: string | null
  defaultTitle?: string | null
  titleTemplate?: string | null
  defaultDescription?: string | null
  defaultShareImage?: string | Media | null
  twitterHandle?: string | null
  preventIndexing?: boolean | null
}

export type NormalisedSiteSettings = {
  siteName: string
  siteUrl: string
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultShareImage: { url: string; alt: string; width?: number; height?: number } | null
  twitterHandle: string | null
  preventIndexing: boolean
}

function normaliseNonEmptyString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function normaliseOptionalNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function resolveAbsoluteSiteUrl(value: string): string {
  // Accept values like "craigdavison.com" but ensure URL parsing works.
  const trimmed = value.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  return `https://${trimmed}`
}

function extractShareImage(mediaValue: SiteSettingsGlobal["defaultShareImage"]): NormalisedSiteSettings["defaultShareImage"] {
  if (!mediaValue || typeof mediaValue !== "object") return null

  const media = mediaValue as Media
  const url = typeof media.url === "string" ? media.url.trim() : ""
  if (!url) return null

  const alt = normaliseNonEmptyString(media.alt, "Site preview image")
  const width = typeof media.width === "number" ? media.width : undefined
  const height = typeof media.height === "number" ? media.height : undefined

  return { url, alt, width, height }
}

/**
 * Reads the Payload `site-settings` Global and returns safe defaults.
 *
 * Uses `cache()` to avoid repeated Payload initialisation and DB calls during a
 * single render pass / request lifecycle.
 */
export const getSiteSettings = cache(async (): Promise<NormalisedSiteSettings> => {
  // Defaults should remain sane even if Payload/DB is unavailable (CI, local build, etc.).
  const fallback: NormalisedSiteSettings = {
    siteName: "Craig Davison",
    siteUrl: "https://craigdavison.com",
    defaultTitle: "Craig Davison — CV",
    titleTemplate: "%s — Craig Davison",
    defaultDescription:
      "Technology professional transitioning into modern web development. Experience in SAP HANA/BW, JavaScript/Node.js/React, and delivery-focused leadership.",
    defaultShareImage: null,
    twitterHandle: null,
    preventIndexing: false,
  }

  try {
    const payload = await getPayloadClient()
    const raw = (await payload.findGlobal({
      slug: "site-settings",
      depth: 1,
    })) as unknown as SiteSettingsGlobal

    const siteUrlFromEnv =
      normaliseOptionalNonEmptyString(process.env.NEXT_PUBLIC_SITE_URL) ??
      normaliseOptionalNonEmptyString(process.env.SITE_URL)

    const siteUrl = resolveAbsoluteSiteUrl(
      normaliseNonEmptyString(raw?.siteUrl, siteUrlFromEnv ?? fallback.siteUrl),
    )

    return {
      siteName: normaliseNonEmptyString(raw?.siteName, fallback.siteName),
      siteUrl,
      defaultTitle: normaliseNonEmptyString(raw?.defaultTitle, fallback.defaultTitle),
      titleTemplate: normaliseNonEmptyString(raw?.titleTemplate, fallback.titleTemplate),
      defaultDescription: normaliseNonEmptyString(
        raw?.defaultDescription,
        fallback.defaultDescription,
      ),
      defaultShareImage: extractShareImage(raw?.defaultShareImage),
      twitterHandle: normaliseOptionalNonEmptyString(raw?.twitterHandle),
      preventIndexing: Boolean(raw?.preventIndexing),
    }
  } catch {
    return fallback
  }
})

