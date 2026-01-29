import Section from "@/components/shared/layout/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/shared/layout/container"
import type { ExperienceItem } from "@/lib/cv-types"
import { ExperienceTimeline } from "@/app/(app)/_sections/experience-timeline"

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <Section id="experience" glow={{ side: "left", tone: "warm" }}>
      <Container variant="left">
        <ContainerIntro variant="left">
          <ContainerEyebrow>Experience</ContainerEyebrow>
          <ContainerTitle>Recent roles and responsibilities</ContainerTitle>
          <ContainerLead>
            A quick overview of positions, impact, and the technologies used.
          </ContainerLead>
        </ContainerIntro>
        <ContainerContent variant="left">
          <ExperienceTimeline items={items} />
        </ContainerContent>
      </Container>

    </Section>
  )
}

