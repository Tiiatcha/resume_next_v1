import type { Metadata } from "next"
import { Suspense } from "react"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { BlogAdminControls } from "@/components/features/blog/admin/blog-admin-controls"
import { BlogPostsData } from "./_components/BlogPostsData"

export const metadata: Metadata = {
  title: "Blog — Craig Davison",
  description:
    "Thoughts, lessons, and behind-the-scenes notes from projects I'm building and shipping.",
}

export const revalidate = 60

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

function BlogPostsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <div className="h-7 w-12 rounded-full bg-muted/60 animate-pulse" />
        <div className="h-7 w-20 rounded-full bg-muted/40 animate-pulse" />
        <div className="h-7 w-24 rounded-full bg-muted/40 animate-pulse" />
        <div className="h-7 w-16 rounded-full bg-muted/40 animate-pulse" />
      </div>

      <section
        aria-label="Loading blog posts"
        aria-busy="true"
        className="grid grid-rows-[repeat(5,auto)] gap-6 grid-flow-row sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </section>
    </div>
  )
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

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

            <Suspense fallback={<BlogPostsLoadingFallback />}>
              <BlogPostsData categorySlug={category} />
            </Suspense>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

