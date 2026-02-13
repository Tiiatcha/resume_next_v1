import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { BlogPostsBrowser } from "./BlogPostsBrowser"

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

interface PaginationState {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface PayloadPaginatedResult<TDocument> {
  docs: TDocument[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const DEFAULT_PAGE_SIZE = 12

function normaliseCategorySlug(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

interface BlogPostsDataProps {
  categorySlug?: string | null
}

/**
 * Efficiently fetches categories that have at least one published blog post.
 *
 * This approach mimics a SQL query with COUNT:
 * 1. Fetch all categories (typically a small set)
 * 2. For each category, count published blog posts that reference it
 * 3. Filter to only categories with count > 0
 *
 * All count queries run in parallel using Promise.all for efficiency.
 * This avoids fetching blog post data and only performs count operations.
 */
async function fetchCategoriesWithPublishedPosts(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
): Promise<Category[]> {
  // Step 1: Fetch all categories (typically a small set, e.g. 10-50 items)
  const allCategoriesResult = await payload.find({
    collection: "categories",
    depth: 0,
    limit: 200,
    sort: "name",
  })

  const allCategories = allCategoriesResult.docs as unknown as Category[]

  // Step 2: For each category, count published blog posts in parallel
  // This is equivalent to: SELECT COUNT(*) FROM blog_posts WHERE category_id = ? AND status = 'published'
  const categoryCountPromises = allCategories.map(async (category) => {
    const countResult = await payload.count({
      collection: "blog-posts",
      where: {
        and: [
          { status: { equals: "published" } },
          { category: { equals: category.id } },
        ],
      },
    })

    return {
      category,
      count: countResult.totalDocs,
    }
  })

  const categoryCounts = await Promise.all(categoryCountPromises)

  // Step 3: Filter to only categories that have at least one published post
  return categoryCounts
    .filter(({ count }) => count > 0)
    .map(({ category }) => category)
}

export async function BlogPostsData({ categorySlug }: BlogPostsDataProps) {
  const activeCategorySlug = normaliseCategorySlug(categorySlug)

  const payload = await getPayloadClient()

  // Fetch categories that have at least one published blog post
  const categories = await fetchCategoriesWithPublishedPosts(payload)

  const activeCategory =
    activeCategorySlug
      ? categories.find((cat) => cat.slug === activeCategorySlug) ?? null
      : null

  const postsResult = (await payload.find({
    collection: "blog-posts",
    depth: 1,
    limit: DEFAULT_PAGE_SIZE,
    page: 1,
    sort: "-publishedAt",
    where: {
      and: [
        { status: { equals: "published" } },
        ...(activeCategory?.id ? [{ category: { equals: activeCategory.id } }] : []),
      ],
    },
  })) as unknown as PayloadPaginatedResult<BlogPostListItem>

  const posts = postsResult.docs

  return (
    <BlogPostsBrowser
      categories={categories}
      initialPosts={posts}
      initialActiveCategoryIds={activeCategory?.id ? [activeCategory.id] : []}
      initialPagination={{
        page: postsResult.page,
        limit: postsResult.limit,
        totalPages: postsResult.totalPages,
        totalDocs: postsResult.totalDocs,
        hasNextPage: postsResult.hasNextPage,
        hasPrevPage: postsResult.hasPrevPage,
      }}
    />
  )
}
