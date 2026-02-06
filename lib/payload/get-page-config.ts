import { cache } from "react"

import { getPayloadClient } from "@/lib/payload/get-payload-client"
import type { PageConfig } from "@/payload-types"

/**
 * Fetches a single page-config document by `pageKey` with depth 1 so hero media
 * and CTA relations (internalBlogPost, internalMedia) are populated.
 *
 * Cached per request so multiple callers get the same result without extra queries.
 *
 * @param pageKey - Stable key (e.g. "home", "about")
 * @returns The page config or null if not found
 */
export const getPageConfig = cache(async (
  pageKey: string,
): Promise<PageConfig | null> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "page-configs",
    where: { pageKey: { equals: pageKey } },
    depth: 1,
    limit: 1,
  })
  const doc = result.docs[0] as PageConfig | undefined
  return doc ?? null
})
