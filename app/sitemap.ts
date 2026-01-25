import type { MetadataRoute } from "next"

/**
 * Dynamic sitemap generation for the App Router.
 *
 * This is served at `/sitemap.xml` automatically by Next.js.
 *
 * Notes:
 * - We prefer an explicit canonical base URL via `NEXT_PUBLIC_SITE_URL`.
 * - On Vercel, `VERCEL_URL` is available (host only, no protocol), so we fall back to that.
 * - Final fallback is the production domain from `package.json#homepage`.
 */
function getSiteBaseUrl(): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredSiteUrl) return configuredSiteUrl.replace(/\/+$/, "")

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/+$/, "")

  return "https://craigdavison.com"
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteBaseUrl = getSiteBaseUrl()
  const lastModified = new Date()

  return [
    {
      url: `${siteBaseUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteBaseUrl}/roadmap`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]
}
