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
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { PayloadRichText } from "@/components/content/payload-rich-text"

export const revalidate = 60

type EndorsementsSectionData = {
  eyebrow?: string | null
  heading?: string | null
  sectionIntro?: SerializedEditorState | null
  copy?: SerializedEditorState | null
  sectionClose?: SerializedEditorState | null
}
// Re-export the type for convenience
export type { EndorsementSummary }


interface EndorsementsSectionProps {
  endorsements: EndorsementSummary[]
  data?: EndorsementsSectionData | null
}

export function EndorsementsSection({
  endorsements,
  data,
}: EndorsementsSectionProps): React.JSX.Element {
  const hasEndorsements = endorsements.length > 0
  const [activeEndorsement, setActiveEndorsement] = React.useState<EndorsementSummary | null>(null)
  const eyebrow = data?.eyebrow ?? null
  const heading = data?.heading ?? null
  const sectionIntro = data?.sectionIntro ?? null

  return (
    <>
      <Section
        id="endorsements"
        surface="alt"
        glow={{ side: "left", tone: "cool" }}
      >
        <Container variant="left">
          <ContainerIntro variant="left">
            <ContainerEyebrow className="eyebrow">{eyebrow}</ContainerEyebrow>
            <ContainerTitle variant="left">{heading}</ContainerTitle>
            <ContainerLead variant="left">
              <PayloadRichText 
                data={sectionIntro}
                className="section-intro text-muted-foreground text-pretty text-lg leading-relaxed" 
              />
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

