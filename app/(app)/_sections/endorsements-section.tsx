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
/* Shadcn UI Components */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselNavButtons,
  CarouselPrevious,
  CarouselNext,
  CarouselViewport,
  CarouselTrack,
  CarouselItem,
} from "@/components/shared/composites/carousel"
import { Reveal } from "@/components/shared/motion/reveal"
/* Endorsement Components */
import type { EndorsementSummary } from "@/app/(app)/endorsements/_components/endorsement-types"
import { EndorsementCard } from "@/app/(app)/endorsements/_components/endorsement-card"
import { EndorsementDetailsPanel } from "@/app/(app)/endorsements/_components/endorsement-details-panel"
import { Button } from "@/components/ui/button"

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
              Short, honest notes from people I have worked with, including clients, colleagues,
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
              <Carousel 
                infinite={true} 
                autoScroll={true} 
                autoScrollIntervalMs={5000}
                autoScrollPauseOnHover={true}
              >
                <CarouselNavButtons>
                  <CarouselPrevious />
                  <CarouselNext />
                </CarouselNavButtons>
                <CarouselViewport className="[mask-image:linear-gradient(to_right,black_88%,transparent)]">
                  <CarouselTrack>
                    {endorsements.map((endorsement) => (
                      <CarouselItem key={endorsement.id}>
                        <EndorsementCard
                          endorsement={endorsement}
                          disableReveal
                          onOpenDetails={setActiveEndorsement}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselTrack>
                </CarouselViewport>
              </Carousel>
            )}
            <div className="mt-4 flex justify-end  w-full ">
              <Button variant="outline">
                <Link href="/endorsements">
                  Endorse me
                </Link>
              </Button>
            </div>
          </ContainerContent>
        </Container>
      </Section>
      { /* The panel is only shown when an endorsement is selected */ }
      <EndorsementDetailsPanel
        endorsement={activeEndorsement}
        onClose={() => setActiveEndorsement(null)}
      />
    </>
  )
}

