'use client'

import * as React from "react"

import Section from "@/components/sections/components/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/sections/components/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/motion/reveal"
import type { EndorsementSummary } from "@/components/sections/endorsements-types"
import { EndorsementCard } from "@/components/sections/endorsement-card"
import { EndorsementDetailsPanel } from "@/components/panels/endorsement-details-panel"

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

