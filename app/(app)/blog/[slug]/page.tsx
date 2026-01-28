import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Image from "next/image"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/layout/site-background"
import { Reveal } from "@/components/motion/reveal"
import Section from "@/components/sections/components/section"
import { Container } from "@/components/sections/components/container"
import { ImageAttribution } from "@/components/blog/image-attribution"
import { PayloadRichText } from "@/components/content/payload-rich-text"
import { Separator } from "@/components/ui/separator"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { BlogAdminControls } from "@/components/blog/blog-admin-menubar"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

export const revalidate = 60

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: SerializedEditorState
  featuredImage?: string | Media | null
  imageAttribution?: {
    platformName?: string | null
    platformUrl?: string | null
    artistName?: string | null
    artistUrl?: string | null
    imageUrl?: string | null
  } | null
  publishedAt?: string | null
  updatedAt?: string | null
}

type Media = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: "blog-posts",
    depth: 1,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: "published" } },
      ],
    },
  })

  const post = result.docs[0] as unknown as BlogPost | undefined
  return post ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {
      title: "Blog post not found — Craig Davison",
      description: "This blog post could not be found.",
    }
  }

  return {
    title: `${post.title} — Craig Davison`,
    description: post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  const featuredImage =
    post.featuredImage && typeof post.featuredImage === "object"
      ? (post.featuredImage as Media)
      : null

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="blog-post" surface="base">
          <Container variant="left">
            <Reveal>
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                    Blog
                  </p>
                  <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                    {post.title}
                  </h1>
                  {post.publishedAt ? (
                    <p className="text-muted-foreground text-sm">
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                    </p>
                  ) : null}
                  {post.excerpt ? (
                    <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>

                {featuredImage?.url && (
                  <figure className="space-y-3">
                    <div className="relative overflow-hidden rounded-2xl border bg-card/60 supports-[backdrop-filter]:bg-card/40">
                      <Image
                        src={featuredImage.url}
                        alt={featuredImage.alt || post.title}
                        width={featuredImage.width ?? 1600}
                        height={featuredImage.height ?? 900}
                        className="w-full h-auto object-cover"
                        priority
                      />
                    </div>
                    <ImageAttribution attribution={post.imageAttribution} />
                  </figure>
                )}

                {!featuredImage?.url && post.imageAttribution && (
                  <ImageAttribution attribution={post.imageAttribution} />
                )}
                
                {/* Admin controls render client-side to allow static page generation */}
                <BlogAdminControls postId={post.id} variant="post" />
              </div>
            </Reveal>

            <Separator className="my-10" />

            <article className="payload-richtext">
              <PayloadRichText data={post.content} />
            </article>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

