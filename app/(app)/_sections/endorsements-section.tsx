'use client'

import * as React from "react"
import Link from "next/link"

import Section from "@/components/shared/layout/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/shared/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/shared/motion/reveal"
import type { EndorsementSummary } from "@/app/(app)/endorsements/_components/endorsement-types"
import { EndorsementCard } from "@/app/(app)/endorsements/_components/endorsement-card"
import { EndorsementDetailsPanel } from "@/app/(app)/endorsements/_components/endorsement-details-panel"

// Re-export the type for convenience
export type { EndorsementSummary }


interface EndorsementsSectionProps {
  endorsements: EndorsementSummary[]
}

export function EndorsementsSection({
  endorsements,
}: EndorsementsSectionProps): React.JSX.Element {
  const hasEndorsements = endorsements.length > 0
  const [activeEndorsement, setActiveEndorsement] = React.useState<EndorsementSummary | null>(null)

  return (
    <>
      <Section
        id="endorsements"
        surface="alt"
        glow={{ side: "left", tone: "cool" }}
      >
        <Container variant="left">
          <ContainerIntro variant="left">
            <ContainerEyebrow>Endorsements</ContainerEyebrow>
            <ContainerTitle>What others say</ContainerTitle>
            <ContainerLead>
              Short, honest notes from people I have worked with — clients, colleagues,
              and managers.
            </ContainerLead>
            <p className="mt-4 text-sm text-muted-foreground">
              Learn about{' '}
              <Link
                href="/blog/building-a-trustworthy-endorsements-system-without-accounts"
                className="text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
              >
                how and why I built this endorsements system
              </Link>{' '}
              with privacy, transparency, and trust at its core.
            </p>
          </ContainerIntro>

          <ContainerContent variant="left">
            {!hasEndorsements ? (
              <Reveal>
                <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Endorsements will appear here
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      As I share this CV with people I have worked with, their comments and
                      endorsements will be published here once approved.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ) : (
              <div className="mt-4 grid w-full gap-4 md:grid-cols-2">
                {endorsements.map((endorsement, index) => (
                  <EndorsementCard
                    key={endorsement.id}
                    endorsement={endorsement}
                    delaySeconds={index * 0.05}
                    onOpenDetails={setActiveEndorsement}
                  />
                ))}
              </div>
            )}
          </ContainerContent>
        </Container>
      </Section>

      <EndorsementDetailsPanel
        endorsement={activeEndorsement}
        onClose={() => setActiveEndorsement(null)}
      />
    </>
  )
}

