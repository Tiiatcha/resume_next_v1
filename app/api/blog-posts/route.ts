import { getPayloadClient } from "@/lib/payload/get-payload-client"
import type { Where } from "payload"

type Media = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

type Category = {
  id: string
  name?: string | null
  slug?: string | null
}

type BlogPostListItem = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | Media | null
  category?: string | Category | null
  publishedAt?: string | null
  updatedAt?: string | null
}

type SortDirection = "publishedAt-desc" | "publishedAt-asc"

interface BlogPostsSuccessResponseBody {
  success: true
  posts: BlogPostListItem[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalDocs: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface BlogPostsErrorResponseBody {
  success: false
  error: string
}

type BlogPostsResponseBody = BlogPostsSuccessResponseBody | BlogPostsErrorResponseBody

interface PayloadPaginatedResult<TDocument> {
  docs: TDocument[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function jsonResponse(body: BlogPostsResponseBody, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

function parsePositiveIntegerParam(
  rawValue: string | null,
  defaultValue: number,
  maxValue: number,
): number {
  if (!rawValue) return defaultValue

  const parsed = Number.parseInt(rawValue, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return defaultValue

  if (parsed > maxValue) return maxValue
  return parsed
}

function parseOptionalIsoDate(rawValue: string | null): string | null {
  if (!rawValue) return null
  const trimmed = rawValue.trim()
  if (!trimmed) return null

  const timestamp = Date.parse(trimmed)
  if (Number.isNaN(timestamp)) return null

  return new Date(timestamp).toISOString()
}

function parseSortDirection(rawValue: string | null): SortDirection {
  if (rawValue === "publishedAt-asc") return "publishedAt-asc"
  return "publishedAt-desc"
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  const page = parsePositiveIntegerParam(searchParams.get("page"), 1, 1_000)
  const limit = parsePositiveIntegerParam(searchParams.get("limit"), 12, 100)
  const sortDirection = parseSortDirection(searchParams.get("sort"))
  const publishedFrom = parseOptionalIsoDate(searchParams.get("publishedFrom"))
  const publishedTo = parseOptionalIsoDate(searchParams.get("publishedTo"))

  const rawCategoryIdParams: string[] = []
  const repeatedCategoryIdParams = searchParams.getAll("categoryId")
  if (repeatedCategoryIdParams.length > 0) {
    rawCategoryIdParams.push(...repeatedCategoryIdParams)
  }

  const commaSeparatedCategoryIds = searchParams.get("categoryIds")
  if (commaSeparatedCategoryIds) {
    rawCategoryIdParams.push(...commaSeparatedCategoryIds.split(","))
  }

  const categoryIds = rawCategoryIdParams
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  try {
    const payload = await getPayloadClient()

    const whereAndConditions: Where[] = [{ status: { equals: "published" } }]

    if (categoryIds.length > 0) {
      whereAndConditions.push({
        category: { in: categoryIds },
      })
    }

    if (publishedFrom) {
      whereAndConditions.push({
        publishedAt: { greater_than_equal: publishedFrom },
      })
    }

    if (publishedTo) {
      whereAndConditions.push({
        publishedAt: { less_than_equal: publishedTo },
      })
    }

    const postsResult = (await payload.find({
      collection: "blog-posts",
      depth: 1,
      sort: sortDirection === "publishedAt-desc" ? "-publishedAt" : "publishedAt",
      page,
      limit,
      where: {
        and: whereAndConditions,
      },
    })) as unknown as PayloadPaginatedResult<BlogPostListItem>

    const responseBody: BlogPostsSuccessResponseBody = {
      success: true,
      posts: postsResult.docs,
      pagination: {
        page: postsResult.page,
        limit: postsResult.limit,
        totalPages: postsResult.totalPages,
        totalDocs: postsResult.totalDocs,
        hasNextPage: postsResult.hasNextPage,
        hasPrevPage: postsResult.hasPrevPage,
      },
    }

    return jsonResponse(responseBody, 200)
  } catch (error) {
    const responseBody: BlogPostsErrorResponseBody = {
      success: false,
      error: "Failed to fetch blog posts. Please try again shortly.",
    }

    // TODO: integrate with centralised error logging when available.
    // console.error("Error in GET /api/blog-posts:", error)

    return jsonResponse(responseBody, 500)
  }
}

