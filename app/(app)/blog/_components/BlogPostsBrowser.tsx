"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Reveal } from "@/components/shared/motion/reveal"
import BlogPostCard from "./BlogPostCard"

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

interface PaginationState {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface BlogPostsBrowserProps {
  categories: Category[]
  initialPosts: BlogPostListItem[]
  initialActiveCategoryIds?: string[]
  initialSortDirection?: SortDirection
  initialPagination: PaginationState
}

interface BlogPostsApiSuccessResponseBody {
  success: true
  posts: BlogPostListItem[]
  pagination: PaginationState
}

interface BlogPostsApiErrorResponseBody {
  success: false
  error: string
}

type BlogPostsApiResponseBody =
  | BlogPostsApiSuccessResponseBody
  | BlogPostsApiErrorResponseBody

const PAGE_SIZE_OPTIONS: number[] = [12, 24, 36, 48]

function getCategoryDisplayName(category: Category): string {
  if (typeof category.name === "string" && category.name.trim().length > 0) {
    return category.name.trim()
  }

  if (typeof category.slug === "string" && category.slug.trim().length > 0) {
    return category.slug.trim()
  }

  return "Untitled category"
}

function BlogPostCardSkeleton() {
  return (
    <div className="grid row-span-5 grid-rows-subgrid">
      <div className="bg-muted/40 rounded-md aspect-[3/2] w-full animate-pulse" />
      <div className="flex flex-col gap-3 py-4">
        <div className="h-3 w-28 rounded-full bg-muted/60 animate-pulse" />
        <div className="h-5 w-3/4 rounded-full bg-muted/70 animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-muted/60 animate-pulse" />
        <div className="mt-2 space-y-2">
          <div className="h-3 w-full rounded-full bg-muted/50 animate-pulse" />
          <div className="h-3 w-5/6 rounded-full bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function BlogPostsBrowser({
  categories,
  initialPosts,
  initialActiveCategoryIds = [],
  initialSortDirection = "publishedAt-desc",
  initialPagination,
}: BlogPostsBrowserProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>(initialPosts)
  const [activeCategoryIds, setActiveCategoryIds] =
    useState<string[]>(initialActiveCategoryIds)
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const totalVisiblePosts = posts.length

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchPosts = useCallback(
    (
      options?: {
        page?: number
        limit?: number
        sortDirection?: SortDirection
        categoryIdsOverride?: string[]
      },
    ) => {
      const nextPage = options?.page ?? pagination.page
      const nextLimit = options?.limit ?? pagination.limit
      const nextSortDirection = options?.sortDirection ?? sortDirection
      const nextCategoryIds =
        options && "categoryIdsOverride" in options && options.categoryIdsOverride
          ? options.categoryIdsOverride
          : activeCategoryIds

      const searchParams = new URLSearchParams()
      searchParams.set("page", String(nextPage))
      searchParams.set("limit", String(nextLimit))
      searchParams.set("sort", nextSortDirection)

      if (nextCategoryIds.length > 0) {
        nextCategoryIds.forEach((categoryId) => {
          searchParams.append("categoryId", categoryId)
        })
      }

      const url = `/api/blog-posts?${searchParams.toString()}`

      startTransition(async () => {
        try {
          setErrorMessage(null)

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`)
          }

          const body = (await response.json()) as BlogPostsApiResponseBody

          if (!body.success) {
            throw new Error(body.error)
          }

          setPosts(body.posts)
          setPagination(body.pagination)
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading posts.",
          )
        }
      })
    },
    [activeCategoryIds, pagination.limit, pagination.page, sortDirection],
  )

  useEffect(() => {
    setPosts(initialPosts)
    setPagination(initialPagination)
  }, [initialPosts, initialPagination])

  const handleClearCategories = () => {
    if (activeCategoryIds.length === 0) return
    setActiveCategoryIds([])
    fetchPosts({ page: 1, categoryIdsOverride: [] })
  }

  const handleToggleCategory = (categoryId: string) => {
    const isActive = activeCategoryIds.includes(categoryId)
    const nextCategoryIds = isActive
      ? activeCategoryIds.filter((id) => id !== categoryId)
      : [...activeCategoryIds, categoryId]

    setActiveCategoryIds(nextCategoryIds)
    fetchPosts({ page: 1, categoryIdsOverride: nextCategoryIds })
  }

  const handleChangePageSize = (nextLimitRaw: string) => {
    const nextLimit = Number.parseInt(nextLimitRaw, 10)
    if (Number.isNaN(nextLimit) || nextLimit <= 0) return

    fetchPosts({ page: 1, limit: nextLimit })
  }

  const handleChangeSortDirection = (nextSortDirectionRaw: string) => {
    const nextSort =
      nextSortDirectionRaw === "publishedAt-asc"
        ? ("publishedAt-asc" as SortDirection)
        : ("publishedAt-desc" as SortDirection)

    setSortDirection(nextSort)
    fetchPosts({ page: 1, sortDirection: nextSort })
  }

  const handleGoToPreviousPage = () => {
    if (!pagination.hasPrevPage) return
    const previousPage = pagination.page - 1
    if (previousPage < 1) return
    fetchPosts({ page: previousPage })
  }

  const handleGoToNextPage = () => {
    if (!pagination.hasNextPage) return
    const nextPage = pagination.page + 1
    if (nextPage > pagination.totalPages) return
    fetchPosts({ page: nextPage })
  }

  const isFirstPage = pagination.page <= 1
  const isLastPage = pagination.page >= pagination.totalPages
  const hasActiveCategoryFilters = activeCategoryIds.length > 0

  return (
    <div className="space-y-6 w-full">
      {categories.length ? (
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClearCategories}
              className="focus-visible:outline-none"
            >
              <Badge variant={hasActiveCategoryFilters ? "outline" : "default"}>
                All
              </Badge>
            </button>
            {categories
              .filter(
                (category) =>
                  typeof category.slug === "string" && category.slug.trim().length > 0,
              )
              .map((category) => {
                const isActive = activeCategoryIds.includes(category.id)
                const displayName = getCategoryDisplayName(category)

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    className="focus-visible:outline-none"
                  >
                    <Badge variant={isActive ? "default" : "outline"}>
                      {displayName}
                    </Badge>
                  </button>
                )
              })}
          </div>
        </Reveal>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Showing{" "}
            <span className="font-medium text-foreground">
              {totalVisiblePosts.toLocaleString("en-GB")}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {pagination.totalDocs.toLocaleString("en-GB")}
            </span>{" "}
            posts
            {hasActiveCategoryFilters
              ? activeCategoryIds.length === 1
                ? " in this category"
                : " in selected categories"
              : null}
          </p>

          {isPending ? (
            <div
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs sm:text-sm text-muted-foreground shadow-sm"
            >
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Applying filters…</span>
            </div>
          ) : null}

          {errorMessage ? (
            <p className="text-destructive text-xs sm:text-sm">{errorMessage}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <Select
              value={sortDirection}
              onValueChange={handleChangeSortDirection}
              disabled={isPending}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishedAt-desc">Newest first</SelectItem>
                <SelectItem value="publishedAt-asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">Posts per page</span>
            <Select
              value={String(pagination.limit)}
              onValueChange={handleChangePageSize}
              disabled={isPending}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!isMounted ? (
        <section
          aria-label="Loading blog posts"
          aria-busy="true"
          className="grid grid-rows-[repeat(5,auto)] gap-6 grid-flow-row sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogPostCardSkeleton key={index} />
          ))}
        </section>
      ) : posts.length ? (
        <div
          aria-busy={isPending}
          className={`grid grid-rows-[repeat(5,auto)] gap-6 grid-flow-row sm:grid-cols-2 lg:grid-cols-3 ${
            isPending ? "opacity-60 transition-opacity duration-150" : ""
          }`}
        >
          {posts.map((post, index) => {
            const featuredImage =
              post.featuredImage && typeof post.featuredImage === "object"
                ? (post.featuredImage as Media)
                : null
            const category =
              post.category && typeof post.category === "object"
                ? (post.category as Category)
                : null

            return (
              <Reveal
                key={post.id}
                delaySeconds={index * 0.05}
                className="grid row-span-5 grid-rows-subgrid"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid row-span-5 grid-rows-subgrid"
                >
                  <BlogPostCard
                    featuredImage={featuredImage}
                    title={post.title}
                    category={category}
                    publishedAt={post.publishedAt}
                    excerpt={post.excerpt}
                  />
                </Link>
              </Reveal>
            )
          })}
        </div>
      ) : (
        <Reveal className="grid row-span-5 grid-rows-subgrid">
          <div className="border bg-card/60 supports-[backdrop-filter]:bg-card/40 rounded-lg p-6">
            <p className="text-muted-foreground text-sm leading-relaxed">
              No posts match these filters yet. Try a different category or sort
              order.
            </p>
          </div>
        </Reveal>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 mt-2">
        <div className="text-muted-foreground text-xs sm:text-sm">
          Page{" "}
          <span className="font-medium text-foreground">
            {pagination.page.toLocaleString("en-GB")}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {pagination.totalPages.toLocaleString("en-GB")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoToPreviousPage}
            disabled={isPending || isFirstPage}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoToNextPage}
            disabled={isPending || isLastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

