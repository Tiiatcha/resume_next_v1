import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { BlogAdminControls } from "@/components/features/blog/admin/blog-admin-controls"
import { Badge } from "@/components/ui/badge"

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

  const postsResult = await payload.find({
    collection: "blog-posts",
    depth: 1,
    limit: 50,
    sort: "-publishedAt",
    where: {
      and: [
        { status: { equals: "published" } },
        ...(activeCategory?.id ? [{ category: { equals: activeCategory.id } }] : []),
      ],
    },
  })

  const posts = postsResult.docs as unknown as BlogPostListItem[]

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

                {categories.length ? (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Link href="/blog">
                      <Badge variant={activeCategorySlug ? "outline" : "default"}>
                        All
                      </Badge>
                    </Link>
                    {categories
                      .filter((cat) => typeof cat.slug === "string" && cat.slug)
                      .map((cat) => {
                        const slug = cat.slug as string
                        const name = typeof cat.name === "string" && cat.name.trim()
                          ? cat.name.trim()
                          : slug

                        const isActive = slug === activeCategorySlug

                        return (
                          <Link key={cat.id} href={`/blog?category=${encodeURIComponent(slug)}`}>
                            <Badge variant={isActive ? "default" : "outline"}>
                              {name}
                            </Badge>
                          </Link>
                        )
                      })}
                  </div>
                ) : null}

                {/* Admin controls render client-side to allow static page generation */}
                <BlogAdminControls variant="list" />
              </div>
            </Reveal>

            <Separator className="my-10" />

            {posts.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, idx) => {
                  const featuredImage =
                    post.featuredImage && typeof post.featuredImage === "object"
                      ? (post.featuredImage as Media)
                      : null
                  const category =
                    post.category && typeof post.category === "object"
                      ? (post.category as Category)
                      : null

                  return (
                    <Reveal key={post.id} delaySeconds={idx * 0.05}>
                      <Link href={`/blog/${post.slug}`} className="group block h-full">
                        <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full overflow-hidden transition-all hover:border-primary/50 p-0">
                          {featuredImage?.url && (
                            <div className="relative aspect-[2/1] w-full overflow-hidden">
                              <Image
                                src={featuredImage.url}
                                alt={featuredImage.alt || post.title}
                                width={featuredImage.width ?? 800}
                                height={featuredImage.height ?? 400}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <CardHeader className="gap-2">
                            {category?.name ? (
                              <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                                {category.name}
                              </p>
                            ) : null}
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {post.title}
                            </CardTitle>
                            {post.publishedAt ? (
                              <p className="text-muted-foreground text-xs">
                                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                })}
                              </p>
                            ) : null}
                          </CardHeader>
                          <CardContent>
                            {post.excerpt ? (
                              <p className="text-muted-foreground text-pretty leading-relaxed">
                                {post.excerpt}
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                Read post →
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            ) : (
              <Reveal>
                <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                  <CardHeader>
                    <CardTitle className="text-base">No posts yet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      I&apos;m working on the first articles—check back soon.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

