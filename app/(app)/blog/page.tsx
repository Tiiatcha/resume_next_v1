import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { BlogAdminControls } from "@/components/features/blog/admin/blog-admin-controls"
import { BlogPostsBrowser } from "./_components/BlogPostsBrowser"

export const metadata: Metadata = {
  title: "Blog — Craig Davison",
  description:
    "Thoughts, lessons, and behind-the-scenes notes from projects I'm building and shipping.",
}

export const revalidate = 60

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

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategorySlug = normaliseCategorySlug(category)

  const payload = await getPayloadClient()

  const categoriesResult = await payload.find({
    collection: "categories",
    depth: 0,
    limit: 200,
    sort: "name",
    where: {
      scopes: { contains: "blog-posts" },
    },
  })

  const categories = categoriesResult.docs as unknown as Category[]
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
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="blog" surface="alt" glow={{ side: "left", tone: "warm" }}>
          <Container variant="left">
            <Reveal>
              <div className="space-y-4">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                  Blog
                </p>
                <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                  Field Notes
                </h1>
                <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
                  Thoughts, lessons, and behind-the-scenes notes from projects I&apos;m
                  building and shipping to ideas and musings.
                </p>

                <BlogAdminControls variant="list" />
              </div>
            </Reveal>

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
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

