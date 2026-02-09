import { cache } from "react"

import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import type { Media } from "@/payload-types"

/** Raw shape of the site-settings global as returned by Payload (depth 1–2). */
type SiteSettingsGlobal = {
  siteName?: string | null
  siteUrl?: string | null
  defaultTitle?: string | null
  titleTemplate?: string | null
  defaultDescription?: string | null
  defaultShareImage?: string | Media | null
  twitterHandle?: string | null
  preventIndexing?: boolean | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactLocation?: string | null
  contactWhatsApp?: string | null
  cvCurrent?: string | Media | null
  cvDisplayName?: string | null
  cvLastUpdated?: string | null
  cvVariants?: Array<{
    label?: string | null
    file?: string | Media | null
    isDefault?: boolean | null
    id?: string | null
  }> | null
  enableBlog?: boolean | null
  enableEndorsements?: boolean | null
  enableRoadmap?: boolean | null
  enableChangelog?: boolean | null
  enableContactForm?: boolean | null
  enableCvDownload?: boolean | null
  privacyPolicyContent?: SerializedEditorState | null
  cookiePolicyContent?: SerializedEditorState | null
  legalLastUpdated?: string | null
}

/** Normalised CV file reference for use in links and labels. */
export type NormalisedCvFile = {
  url: string
  filename: string
  displayName: string | null
  lastUpdated: string | null
}

/** Normalised CV variant for optional multiple downloads. */
export type NormalisedCvVariant = {
  label: string
  url: string
  filename: string
  isDefault: boolean
}

/**
 * Normalised site settings with safe defaults and resolved media/rich text.
 * Use this type when consuming settings in the app.
 */
export type NormalisedSiteSettings = {
  siteName: string
  siteUrl: string
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultShareImage: { url: string; alt: string; width?: number; height?: number } | null
  twitterHandle: string | null
  preventIndexing: boolean
  contactEmail: string
  contactPhone: string | null
  contactLocation: string | null
  contactWhatsApp: string | null
  cvCurrent: NormalisedCvFile | null
  cvVariants: NormalisedCvVariant[]
  enableBlog: boolean
  enableEndorsements: boolean
  enableRoadmap: boolean
  enableChangelog: boolean
  enableContactForm: boolean
  enableCvDownload: boolean
  privacyPolicyContent: SerializedEditorState | null
  cookiePolicyContent: SerializedEditorState | null
  legalLastUpdated: string | null
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

function extractCvFile(
  mediaValue: SiteSettingsGlobal["cvCurrent"],
  displayName: string | null,
  lastUpdated: string | null,
): NormalisedSiteSettings["cvCurrent"] {
  if (!mediaValue || typeof mediaValue !== "object") return null

  const media = mediaValue as Media
  const url = typeof media.url === "string" ? media.url.trim() : ""
  if (!url) return null

  const filename = typeof media.filename === "string" ? media.filename : "document.pdf"
  return {
    url,
    filename,
    displayName: normaliseOptionalNonEmptyString(displayName),
    lastUpdated: normaliseOptionalNonEmptyString(lastUpdated),
  }
}

function extractCvVariants(
  variants: SiteSettingsGlobal["cvVariants"],
): NormalisedCvVariant[] {
  if (!Array.isArray(variants)) return []

  return variants
    .filter((v) => v?.file && typeof v.file === "object" && typeof (v.file as Media).url === "string")
    .map((v) => {
      const media = v.file as Media
      return {
        label: normaliseNonEmptyString(v.label, "CV"),
        url: (media.url as string).trim(),
        filename: typeof media.filename === "string" ? media.filename : "document.pdf",
        isDefault: Boolean(v?.isDefault),
      }
    })
}

/**
 * Lexical editor state is stored as an object with root.children; pass through if valid.
 */
function normaliseRichText(
  value: unknown,
): SerializedEditorState | null {
  if (value == null) return null
  if (typeof value !== "object" || !("root" in value)) return null
  const root = (value as SerializedEditorState).root
  if (!root || typeof root !== "object" || !Array.isArray(root.children)) return null
  return value as SerializedEditorState
}

/**
 * Reads the Payload `site-settings` Global and returns safe defaults.
 *
 * Uses `cache()` to avoid repeated Payload initialisation and DB calls during a
 * single render pass / request lifecycle.
 *
 * Consumption examples:
 * - contactEmail / contactPhone / contactLocation / contactWhatsApp: Footer
 *   (getContactHrefsFromSettings) and any contact section that uses site settings.
 * - cvCurrent: Footer CV download button (url + displayName).
 * - enableEndorsements / enableContactForm / enableBlog / etc.: Home page section
 *   visibility, Header nav items, Footer link lists (see useSiteSettings in those components).
 * - privacyPolicyContent / cookiePolicyContent: Render with PayloadRichText on
 *   policy pages (e.g. app/(app)/privacy/page.tsx).
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
    contactEmail: "",
    contactPhone: null,
    contactLocation: null,
    contactWhatsApp: null,
    cvCurrent: null,
    cvVariants: [],
    enableBlog: true,
    enableEndorsements: true,
    enableRoadmap: true,
    enableChangelog: true,
    enableContactForm: true,
    enableCvDownload: true,
    privacyPolicyContent: null,
    cookiePolicyContent: null,
    legalLastUpdated: null,
  }

  try {
    const payload = await getPayloadClient()
    const raw = (await payload.findGlobal({
      slug: "site-settings",
      depth: 2,
    })) as unknown as SiteSettingsGlobal

    const siteUrlFromEnv =
      normaliseOptionalNonEmptyString(process.env.NEXT_PUBLIC_SITE_URL) ??
      normaliseOptionalNonEmptyString(process.env.SITE_URL)

    const siteUrl = resolveAbsoluteSiteUrl(
      normaliseNonEmptyString(raw?.siteUrl, siteUrlFromEnv ?? fallback.siteUrl),
    )

    const cvDisplayName = raw?.cvDisplayName ?? null
    const cvLastUpdated = raw?.cvLastUpdated ?? null

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
      contactEmail: normaliseNonEmptyString(raw?.contactEmail, fallback.contactEmail),
      contactPhone: normaliseOptionalNonEmptyString(raw?.contactPhone),
      contactLocation: normaliseOptionalNonEmptyString(raw?.contactLocation),
      contactWhatsApp: normaliseOptionalNonEmptyString(raw?.contactWhatsApp),
      cvCurrent: extractCvFile(raw?.cvCurrent, cvDisplayName, cvLastUpdated),
      cvVariants: extractCvVariants(raw?.cvVariants),
      enableBlog: raw?.enableBlog !== false,
      enableEndorsements: raw?.enableEndorsements !== false,
      enableRoadmap: raw?.enableRoadmap !== false,
      enableChangelog: raw?.enableChangelog !== false,
      enableContactForm: raw?.enableContactForm !== false,
      enableCvDownload: raw?.enableCvDownload !== false,
      privacyPolicyContent: normaliseRichText(raw?.privacyPolicyContent),
      cookiePolicyContent: normaliseRichText(raw?.cookiePolicyContent),
      legalLastUpdated: normaliseOptionalNonEmptyString(
        typeof raw?.legalLastUpdated === "string" ? raw.legalLastUpdated : null,
      ),
    }
  } catch {
    return fallback
  }
})

