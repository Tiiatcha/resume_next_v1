import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/layout/site-background"
import { Reveal } from "@/components/motion/reveal"
import { Container } from "@/components/sections/components/container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPayloadClient } from "@/lib/payload/get-payload-client"

export const metadata: Metadata = {
  title: "Roadmap — Craig Davison",
  description:
    "Planned improvements and upcoming features for Craig Davison’s CV/portfolio site.",
}

export const revalidate = 60

type RoadmapStatus = "Now" | "Next" | "Later"

type RoadmapItem = {
  status: RoadmapStatus
  title: string
  description: string
  bullets: string[]
}

type RoadmapCtaVariant = "outline" | "ghost"

type RoadmapGlobal = {
  kicker?: string | null
  heading?: string | null
  lead?: string | null
  note?: string | null
  ctaLinks?: Array<{
    label?: string | null
    href?: string | null
    variant?: RoadmapCtaVariant | null
  }> | null
  now?: RoadmapColumnGroup | null
  next?: RoadmapColumnGroup | null
  later?: RoadmapColumnGroup | null
}

type RoadmapColumnGroup = {
  isVisible?: boolean | null
  title?: string | null
  description?: string | null
  bullets?: Array<{ text?: string | null }> | null
}

const fallbackRoadmapContent = {
  kicker: "Site roadmap",
  heading: "What I’m building next",
  lead:
    "This site is intentionally evolving. The goal is to keep the CV fast and readable while adding CMS-backed content that’s easy to maintain (projects, experience, endorsements, and a small blog).",
  note: "Note: this is a direction-of-travel list, not a promise of dates.",
  ctaLinks: [
    { label: "View projects", href: "/#projects", variant: "outline" as const },
    { label: "View experience", href: "/#experience", variant: "ghost" as const },
    { label: "Changelog", href: "/changelog", variant: "outline" as const },
  ],
  items: [
    {
      status: "Now" as const,
      title: "Payload CMS foundation",
      description:
        "Introduce an editorial workflow so content updates don’t require code changes.",
      bullets: [
        "Add Payload CMS (auth + admin) with a clean content model",
        "Move projects and experience to CMS-backed collections",
        "Add an endorsements collection with moderation + “featured” support",
      ],
    },
    {
      status: "Next" as const,
      title: "Mini blog + richer project case studies",
      description: "Make it easier to share learnings and show depth per project.",
      bullets: [
        "Add blog posts with draft/publish states and tags",
        "Support richer content blocks (images, links, callouts)",
        "Add project detail pages generated from CMS content",
      ],
    },
    {
      status: "Later" as const,
      title: "Polish, discoverability, and ops",
      description:
        "Improve navigation, long-term maintainability, and content distribution.",
      bullets: [
        "RSS feed for blog posts",
        "Privacy-friendly analytics for content performance",
        "Performance and accessibility audits as the site grows",
      ],
    },
  ],
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function normaliseText(value: unknown, fallback: string): string {
  return isNonEmptyString(value) ? value.trim() : fallback
}

function normaliseCtaVariant(value: unknown, fallback: RoadmapCtaVariant): RoadmapCtaVariant {
  return value === "outline" || value === "ghost" ? value : fallback
}

function ensureChangelogCta(
  ctaLinks: Array<{ label: string; href: string; variant: RoadmapCtaVariant }>,
): Array<{ label: string; href: string; variant: RoadmapCtaVariant }> {
  const hasChangelog = ctaLinks.some((cta) => cta.href === "/changelog")
  if (hasChangelog) return ctaLinks
  return [...ctaLinks, { label: "Changelog", href: "/changelog", variant: "outline" }]
}

function normaliseBulletTextList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback

  const bullets = value
    .map((bullet) => (bullet && typeof bullet === "object" ? (bullet as { text?: unknown }).text : undefined))
    .filter(isNonEmptyString)
    .map((text) => text.trim())

  return bullets.length ? bullets : fallback
}

async function getRoadmapContent(): Promise<{
  kicker: string
  heading: string
  lead: string
  note: string
  ctaLinks: Array<{ label: string; href: string; variant: RoadmapCtaVariant }>
  items: RoadmapItem[]
}> {
  // Best-effort DB read: if Payload/DB isn't reachable (local builds, CI, etc.),
  // fall back to the code-defined content so the page still renders.
  try {
    const payload = await getPayloadClient()
    const roadmap = (await payload.findGlobal({
      slug: "roadmap",
      depth: 0,
    })) as unknown as RoadmapGlobal

    const kicker = normaliseText(roadmap?.kicker, fallbackRoadmapContent.kicker)
    const heading = normaliseText(roadmap?.heading, fallbackRoadmapContent.heading)
    const lead = normaliseText(roadmap?.lead, fallbackRoadmapContent.lead)
    const note = normaliseText(roadmap?.note, fallbackRoadmapContent.note)

    const ctaLinksFromCms = Array.isArray(roadmap?.ctaLinks)
      ? roadmap.ctaLinks
          .map((cta, idx) => {
            const fallbackCta = fallbackRoadmapContent.ctaLinks[idx]
            return {
              label: normaliseText(cta?.label, fallbackCta?.label ?? "Learn more"),
              href: normaliseText(cta?.href, fallbackCta?.href ?? "/"),
              variant: normaliseCtaVariant(cta?.variant, fallbackCta?.variant ?? "outline"),
            }
          })
          .filter((cta) => Boolean(cta.label) && Boolean(cta.href))
      : []

    const ctaLinksBase = ctaLinksFromCms.length ? ctaLinksFromCms : fallbackRoadmapContent.ctaLinks
    const ctaLinks = ensureChangelogCta(ctaLinksBase)

    const statusToGroup: Record<RoadmapStatus, RoadmapColumnGroup | null | undefined> = {
      Now: roadmap?.now,
      Next: roadmap?.next,
      Later: roadmap?.later,
    }

    const items = fallbackRoadmapContent.items.reduce<RoadmapItem[]>((acc, fallbackItem) => {
      const group = statusToGroup[fallbackItem.status]
      const isVisible = group?.isVisible
      if (isVisible === false) return acc

      acc.push({
        status: fallbackItem.status,
        title: normaliseText(group?.title, fallbackItem.title),
        description: normaliseText(group?.description, fallbackItem.description),
        bullets: normaliseBulletTextList(group?.bullets, fallbackItem.bullets),
      })

      return acc
    }, [])

    return { kicker, heading, lead, note, ctaLinks, items }
  } catch {
    return {
      kicker: fallbackRoadmapContent.kicker,
      heading: fallbackRoadmapContent.heading,
      lead: fallbackRoadmapContent.lead,
      note: fallbackRoadmapContent.note,
      ctaLinks: ensureChangelogCta(fallbackRoadmapContent.ctaLinks),
      items: fallbackRoadmapContent.items,
    }
  }
}

function RoadmapStatusLabel({ status }: { status: RoadmapStatus }) {
  const statusStylesByStatus: Record<RoadmapStatus, string> = {
    Now: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300",
    Next: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300",
    Later: "bg-zinc-500/10 text-zinc-700 ring-1 ring-zinc-500/20 dark:text-zinc-300",
  }

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStylesByStatus[status],
      ].join(" ")}
    >
      {status}
    </span>
  )
}

export default async function RoadmapPage() {
  const { kicker, heading, lead, note, ctaLinks, items } = await getRoadmapContent()

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Container variant="left" className="py-12 sm:py-16">
          <Reveal>
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
                {kicker}
              </p>
              <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
                {heading}
              </h1>
              <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
                {lead}
              </p>
              <p className="text-muted-foreground max-w-prose text-sm">
                {note}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {ctaLinks.map((cta) => (
                  <Button key={`${cta.href}-${cta.label}`} asChild variant={cta.variant} size="sm">
                    <Link href={cta.href}>{cta.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </Reveal>

          <Separator className="my-10" />

          <div className="grid gap-6 lg:grid-cols-3">
            {items.map((item, idx) => (
              <Reveal key={item.status} className="h-full" delaySeconds={idx * 0.05}>
                <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <RoadmapStatusLabel status={item.status} />
                    </div>
                    <CardDescription className="text-pretty">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground grid list-disc gap-2 pl-5 text-sm">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </main>

      <Footer />
    </SiteBackground>
  )
}

