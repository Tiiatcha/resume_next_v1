import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/layout/site-background"
import { Reveal } from "@/components/motion/reveal"
import Section from "@/components/sections/components/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/sections/components/container"
import { EndorsementForm } from "@/components/sections/endorsement-form"
import { Separator } from "@/components/ui/separator"




export const metadata: Metadata = {
  title: "Endorsements — Craig Davison",
  description:
    "Share a short endorsement about what it was like to work with Craig Davison. Your words help future employers and clients understand how you collaborate and deliver.",
}

export default function EndorsementsPage(): React.JSX.Element {
  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="endorsements" surface="alt" glow={{ side: "right", tone: "cool" }}>
          <Container variant="left" className="py-12 sm:py-16">
            <ContainerIntro variant="left" className="gap-3">
              <ContainerEyebrow>Endorsements</ContainerEyebrow>
              <ContainerTitle>
                A short note for people considering working with me
              </ContainerTitle>
              <ContainerLead variant="left">
                If we have worked together and you are comfortable doing so, a brief,
                honest endorsement goes a long way. Thank you for helping future employers
                and clients understand how I show up in real projects.
              </ContainerLead>
            </ContainerIntro>

            <ContainerContent variant="left" className="mt-8 gap-8">
              <Reveal>
                <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                  This form is intended for clients, colleagues, managers, and collaborators
                  who have worked with me directly. Your endorsement will be stored in my
                  content system (Payload CMS) and, once approved, may be shown on my public
                  CV site. You can choose exactly which details are displayed, and you can
                  ask me to update or remove your endorsement at any time.
                </p>
              </Reveal>

              <Separator className="my-2" />

              <Reveal>
                <EndorsementForm />
              </Reveal>
            </ContainerContent>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}

