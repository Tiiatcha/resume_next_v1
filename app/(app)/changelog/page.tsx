import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/shared/primitives/tag"
import { getPayloadClient } from "@/lib/payload/get-payload-client"

export const metadata: Metadata = {
  title: "Changelog — Craig Davison",
  description:
    "A running list of updates shipped to Craig Davison’s CV/portfolio site.",
}

export const revalidate = 60

type ChangeType = "added" | "changed" | "fixed" | "removed" | "security"

type ChangelogEntryListItem = {
  id: string
  title: string
  slug: string
  status?: "draft" | "published" | null
  publishedAt?: string | null
  version?: string | null
  summary?: string | null
  changes?: Array<{ type?: ChangeType | null; linkKind?: "none" | "external" | "internal" | null }> | null
}

const badgeLabelByType: Record<ChangeType, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
}

const orderedChangeTypes: ChangeType[] = ["added", "changed", "fixed", "removed", "security"]

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
      {count} {badgeLabelByType[type]}
    </Tag>
  )
}

function formatChangeDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

function countChangesByType(changes: ChangelogEntryListItem["changes"]): Record<ChangeType, number> {
  const counts: Record<ChangeType, number> = {
    added: 0,
    changed: 0,
    fixed: 0,
    removed: 0,
    security: 0,
  }

  if (!Array.isArray(changes)) return counts

  for (const change of changes) {
    const type = change?.type
    if (
      type === "added" ||
      type === "changed" ||
      type === "fixed" ||
      type === "removed" ||
      type === "security"
    ) {
      counts[type] += 1
    }
  }

  return counts
}

export default async function ChangelogIndexPage() {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: "changelog-entries",
    depth: 0,
    limit: 100,
    sort: "-publishedAt",
    where: {
      status: { equals: "published" },
    },
  })

  const entries = result.docs as unknown as ChangelogEntryListItem[]

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="changelog" surface="alt" glow={{ side: "left", tone: "warm" }}>
          <Container variant="left">
            <Reveal>
              <div className="space-y-4">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                  Changelog
                </p>
                <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                  Shipping notes
                </h1>
                <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
                  A lightweight log of updates as this site evolves—part build exercise, part record of what’s been shipped.
                </p>
              </div>
            </Reveal>

            <Separator className="my-10" />

            {entries.length ? (
              <ol
                className={
                  // Timeline layout (intentionally single-sided):
                  // - Mobile + Desktop: left border line with entries on the right
                  // - No alternating cards; changelog reads better as a single stream
                  "mt-8 space-y-6 border-l pl-6"
                }
              >
                {entries.map((entry, idx) => {
                  const changeCounts = countChangesByType(entry.changes)

                  return (
                    <li key={entry.id} className="relative">
                      <span
                        aria-hidden="true"
                        className="bg-background ring-border absolute -left-[33px] top-6 grid size-4 place-items-center rounded-full ring-4"
                      >
                        <span className="bg-primary size-1.5 rounded-full" />
                      </span>

                      <Reveal delaySeconds={idx * 0.05}>
                        <Link
                          href={`/changelog/${entry.slug}`}
                          className="group block"
                        >
                          <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 transition-all hover:border-primary/50">
                            <CardHeader className="gap-2">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                  {entry.title}
                                </CardTitle>

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
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                              {typeof entry.summary === "string" && entry.summary.trim() ? (
                                <p className="text-muted-foreground text-pretty leading-relaxed">
                                  {entry.summary.trim()}
                                </p>
                              ) : null}

                              {orderedChangeTypes.some((type) => changeCounts[type] > 0) ? (
                                <div className="flex flex-wrap gap-2">
                                  {orderedChangeTypes
                                    .filter((type) => changeCounts[type] > 0)
                                    .map((type) => (
                                      <ChangeTypeCountBadge
                                        key={type}
                                        type={type}
                                        count={changeCounts[type]}
                                      />
                                    ))}
                                </div>
                              ) : null}
                            </CardContent>
                          </Card>
                        </Link>
                      </Reveal>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <Reveal>
                <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                  <CardHeader>
                    <CardTitle className="text-base">No changelog entries yet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Updates will appear here once the first entries are published.
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

