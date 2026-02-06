/**
 * Resolves hero (or other) CTA config from page-configs into a concrete URL and
 * openInNewTab flag for use on the frontend (e.g. <a href={url} target={...}>).
 *
 * Handles:
 * - External links: uses externalUrl and openInNewTab.
 * - Internal route/anchor: uses internalHref (e.g. "#contact", "/blog").
 * - Internal document: resolves from the selected collection (blog-posts, media, etc.)
 *   using a small registry so new collections can be added in one place.
 *
 * Expects CTA data to be fetched with depth >= 1 so relationship/upload fields
 * (internalBlogPost, internalMedia) are populated when linkKind is internal and
 * internalLinkMode is "document".
 */

/**
 * CTA row shape as returned from page-configs with depth 1 (populated relations).
 * When you add a new internal-document collection in PageConfigs, add the
 * corresponding field here and one entry to INTERNAL_DOCUMENT_HANDLERS below.
 */
export type CtaRow = {
  label: string
  variant?: string | null
  linkKind: "internal" | "external"
  internalLinkMode?: "route" | "document" | null
  internalHref?: string | null
  internalCollection?: string | null
  internalBlogPost?: string | { slug?: string | null } | null
  internalMedia?: string | { url?: string | null } | null
  externalUrl?: string | null
  openInNewTab?: boolean | null
}

export type CtaLinkResult = {
  /** Resolved href for use in <a> or Next.js Link. Empty string if unresolvable. */
  url: string
  /** Whether to open in a new tab (only relevant for external links). */
  openInNewTab: boolean
}

/**
 * Registry: for each internal "document" collection, how to get the document from
 * the CTA and how to turn it into a URL. When adding a new collection:
 * 1. Add the CTA field (e.g. internalChangelogEntry) and internalCollection option in PageConfigs.
 * 2. Add that field to the CtaRow type above.
 * 3. Add one entry here with getDoc and urlFromDoc.
 */
const INTERNAL_DOCUMENT_HANDLERS: Record<
  string,
  { getDoc: (cta: CtaRow) => unknown; urlFromDoc: (doc: unknown) => string }
> = {
  "blog-posts": {
    getDoc: (cta) => cta.internalBlogPost,
    urlFromDoc: (doc) => {
      const d = doc as { slug?: string | null } | null | undefined
      const slug = d?.slug?.trim()
      return slug ? `/blog/${encodeURIComponent(slug)}` : ""
    },
  },
  media: {
    getDoc: (cta) => cta.internalMedia,
    urlFromDoc: (doc) => {
      const d = doc as { url?: string | null } | null | undefined
      return (d?.url?.trim() ?? "") || ""
    },
  },
}

/**
 * Returns the URL and openInNewTab flag for a single CTA row.
 * Use when rendering hero (or other) CTAs from page-configs.
 *
 * @param cta - One item from hero.ctas (or equivalent), with relations populated (depth >= 1)
 * @returns { url, openInNewTab }. url is empty string if the CTA cannot be resolved (e.g. document not populated).
 */
export function getCtaUrl(cta: CtaRow): CtaLinkResult {
  if (cta.linkKind === "external") {
    const url = (cta.externalUrl ?? "").trim()
    return {
      url: url || "#",
      openInNewTab: Boolean(cta.openInNewTab),
    }
  }

  // Internal
  if (cta.internalLinkMode === "route") {
    const url = (cta.internalHref ?? "").trim()
    return { url: url || "#", openInNewTab: false }
  }

  if (cta.internalLinkMode === "document" && cta.internalCollection) {
    const collection = cta.internalCollection.trim()
    const handler = INTERNAL_DOCUMENT_HANDLERS[collection]
    if (handler) {
      const doc = handler.getDoc(cta)
      // If doc is still an ID (string), we can't resolve; require depth >= 1.
      if (typeof doc === "object" && doc !== null) {
        const url = handler.urlFromDoc(doc).trim()
        return { url: url || "#", openInNewTab: false }
      }
    }
    return { url: "#", openInNewTab: false }
  }

  // Fallback: treat as route and use internalHref if present
  const url = (cta.internalHref ?? "").trim()
  return { url: url || "#", openInNewTab: false }
}
