import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/shared/primitives/tag"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPayloadClient } from "@/lib/payload/get-payload-client"

export const revalidate = 60

type ChangeType = "added" | "changed" | "fixed" | "removed" | "security"

type BlogPostLinkTarget = {
  slug?: string | null
  title?: string | null
}

type ChangeLinkKind = "none" | "external" | "internal"

type ChangelogEntry = {
  id: string
  title: string
  slug: string
  status?: "draft" | "published" | null
  publishedAt?: string | null
  version?: string | null
  summary?: string | null
  changes?: Array<{
    type?: ChangeType | null
    text?: string | null
    linkKind?: ChangeLinkKind | null
    externalUrl?: string | null
    internalCollection?: "blog-posts" | null
    internalBlogPost?: string | BlogPostLinkTarget | null
  }> | null
  relatedPost?: string | { slug?: string | null; title?: string | null } | null
}

const sectionHeadingByType: Record<ChangeType, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
}

function ChangeTypeCountBadge({ type, count }: { type: ChangeType; count: number }) {
  const variantByType: Record<ChangeType, "emerald" | "sky" | "amber" | "zinc" | "rose"> = {
    added: "emerald",
    changed: "sky",
    fixed: "amber",
    removed: "zinc",
    security: "rose",
  }

  return (
    <Tag variant={variantByType[type]}>
      {count} {sectionHeadingByType[type]}
    </Tag>
  )
}

function formatChangeDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  })
}

function isChangeType(value: unknown): value is ChangeType {
  return (
    value === "added" ||
    value === "changed" ||
    value === "fixed" ||
    value === "removed" ||
    value === "security"
  )
}

function getChangeLinkTarget(change: NonNullable<NonNullable<ChangelogEntry["changes"]>[number]>): {
  href: string
  label?: string
} | null {
  const linkKind = change?.linkKind

  if (linkKind === "external") {
    const url = typeof change.externalUrl === "string" ? change.externalUrl.trim() : ""
    return url ? { href: url } : null
  }

  if (linkKind === "internal" && change.internalCollection === "blog-posts") {
    const blogPost =
      change.internalBlogPost && typeof change.internalBlogPost === "object"
        ? (change.internalBlogPost as BlogPostLinkTarget)
        : null

    const slug = typeof blogPost?.slug === "string" ? blogPost.slug.trim() : ""
    if (!slug) return null

    return {
      href: `/blog/${slug}`,
      label: blogPost?.title ?? undefined,
    }
  }

  return null
}

function groupChangesByType(
  changes: ChangelogEntry["changes"],
): Record<ChangeType, Array<{ text: string; href?: string; hrefLabel?: string }>> {
  const grouped: Record<
    ChangeType,
    Array<{ text: string; href?: string; hrefLabel?: string }>
  > = {
    added: [],
    changed: [],
    fixed: [],
    removed: [],
    security: [],
  }

  if (!Array.isArray(changes)) return grouped

  for (const change of changes) {
    if (!isChangeType(change?.type)) continue
    const text = typeof change?.text === "string" ? change.text.trim() : ""
    if (!text) continue

    const linkTarget = getChangeLinkTarget(change)
    grouped[change.type].push(
      linkTarget ? { text, href: linkTarget.href, hrefLabel: linkTarget.label } : { text },
    )
  }

  return grouped
}

async function getPublishedEntryBySlug(slug: string): Promise<ChangelogEntry | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: "changelog-entries",
    depth: 1,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
    },
  })

  const entry = result.docs[0] as unknown as ChangelogEntry | undefined
  return entry ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = await getPublishedEntryBySlug(slug)

  if (!entry) {
    return {
      title: "Changelog entry not found — Craig Davison",
      description: "This changelog entry could not be found.",
    }
  }

  return {
    title: `${entry.title} — Changelog — Craig Davison`,
    description: entry.summary ?? undefined,
  }
}

export default async function ChangelogEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await getPublishedEntryBySlug(slug)
  if (!entry) notFound()

  const groups = groupChangesByType(entry.changes)
  const orderedTypes: ChangeType[] = ["added", "changed", "fixed", "removed", "security"]
  const totalByType = orderedTypes.map((type) => ({ type, count: groups[type].length }))

  const relatedPost =
    entry.relatedPost && typeof entry.relatedPost === "object"
      ? entry.relatedPost
      : null

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="changelog-entry" surface="base">
          <Container variant="left">
            <Reveal>
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                    <Link href="/changelog" className="hover:text-foreground transition-colors">
                      Changelog
                    </Link>
                  </p>

                  <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                    {entry.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    {typeof entry.version === "string" && entry.version.trim() ? (
                      <Badge variant="outline">{entry.version.trim()}</Badge>
                    ) : null}
                    {typeof entry.publishedAt === "string" ? (
                      <Badge variant="secondary">
                        {formatChangeDate(entry.publishedAt)}
                      </Badge>
                    ) : null}
                  </div>

                  {typeof entry.summary === "string" && entry.summary.trim() ? (
                    <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
                      {entry.summary.trim()}
                    </p>
                  ) : null}

                  {totalByType.some((item) => item.count > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {totalByType
                        .filter((item) => item.count > 0)
                        .map((item) => (
                          <ChangeTypeCountBadge
                            key={item.type}
                            type={item.type}
                            count={item.count}
                          />
                        ))}
                    </div>
                  ) : null}

                  {relatedPost?.slug ? (
                    <p className="text-muted-foreground text-sm">
                      Want more detail?{" "}
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                      >
                        Read the deep dive →
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            </Reveal>

            <Separator className="my-10" />

            <div className="grid gap-6">
              {orderedTypes.map((type) => {
                const items = groups[type]
                if (!items.length) return null

                return (
                  <Reveal key={type}>
                    <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                      <CardHeader className="gap-2">
                        <CardTitle className="text-base">
                          {items.length} {sectionHeadingByType[type]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-muted-foreground grid list-disc gap-2 pl-5 text-sm">
                          {items.map((item) => (
                            <li key={`${type}-${item.text}`}>
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                                >
                                  {item.text}
                                </Link>
                              ) : (
                                item.text
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Reveal>
                )
              })}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

