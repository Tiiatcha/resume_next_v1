import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/layout/site-background"
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

export const metadata: Metadata = {
  title: "Roadmap — Craig Davison",
  description:
    "Planned improvements and upcoming features for Craig Davison’s CV/portfolio site.",
}

type RoadmapStatus = "Now" | "Next" | "Later"

type RoadmapItem = {
  status: RoadmapStatus
  title: string
  description: string
  bullets: readonly string[]
}

const roadmapItems: readonly RoadmapItem[] = [
  {
    status: "Now",
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
    status: "Next",
    title: "Mini blog + richer project case studies",
    description: "Make it easier to share learnings and show depth per project.",
    bullets: [
      "Add blog posts with draft/publish states and tags",
      "Support richer content blocks (images, links, callouts)",
      "Add project detail pages generated from CMS content",
    ],
  },
  {
    status: "Later",
    title: "Polish, discoverability, and ops",
    description:
      "Improve navigation, long-term maintainability, and content distribution.",
    bullets: [
      "RSS feed for blog posts",
      "Privacy-friendly analytics for content performance",
      "Performance and accessibility audits as the site grows",
    ],
  },
]

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

export default function RoadmapPage() {
  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Container variant="left" className="py-12 sm:py-16">
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              Site roadmap
            </p>
            <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
              What I’m building next
            </h1>
            <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
              This site is intentionally evolving. The goal is to keep the CV
              fast and readable while adding CMS-backed content that’s easy to
              maintain (projects, experience, endorsements, and a small blog).
            </p>
            <p className="text-muted-foreground max-w-prose text-sm">
              Note: this is a direction-of-travel list, not a promise of dates.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/#projects">View projects</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/#experience">View experience</Link>
              </Button>
            </div>
          </div>

          <Separator className="my-10" />

          <div className="grid gap-6 lg:grid-cols-3">
            {roadmapItems.map((item) => (
              <Card key={item.status} className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
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
            ))}
          </div>
        </Container>
      </main>

      <Footer />
    </SiteBackground>
  )
}

