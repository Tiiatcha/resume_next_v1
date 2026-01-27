import type { MetadataRoute } from "next"
import { getPayloadClient } from "@/lib/payload/get-payload-client"

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteBaseUrl = getSiteBaseUrl()
  const lastModified = new Date()

  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteBaseUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteBaseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteBaseUrl}/roadmap`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Best-effort: include individual blog posts if the database is reachable.
  // This avoids breaking builds/environments where the DB is intentionally absent.
  try {
    const payload = await getPayloadClient()
    const posts = await payload.find({
      collection: "blog-posts",
      depth: 0,
      limit: 500,
      sort: "-publishedAt",
      where: {
        status: { equals: "published" },
      },
    })

    const postEntries: MetadataRoute.Sitemap = []

    for (const doc of posts.docs) {
      const slug = (doc as { slug?: unknown }).slug
      if (typeof slug !== "string" || !slug) continue

      const updatedAt = (doc as { updatedAt?: unknown }).updatedAt
      const lastModifiedForPost =
        typeof updatedAt === "string" ? new Date(updatedAt) : lastModified

      postEntries.push({
        url: `${siteBaseUrl}/blog/${slug}`,
        lastModified: lastModifiedForPost,
        changeFrequency: "monthly",
        priority: 0.5,
      })
    }

    return [...baseEntries, ...postEntries]
  } catch {
    return baseEntries
  }
}
