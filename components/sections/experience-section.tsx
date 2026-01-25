import Section from "@/components/sections/components/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/sections/components/container"
import type { ExperienceItem } from "@/lib/cv-types"
import { ExperienceTimeline } from "@/components/sections/experience-timeline"

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <Section id="experience" glow={{ side: "right", tone: "cool" }}>
      <Container variant="left">
        <ContainerIntro variant="left">
          <ContainerEyebrow>Experience</ContainerEyebrow>
          <ContainerTitle>Recent roles and responsibilities</ContainerTitle>
          <ContainerLead>
            A quick overview of positions, impact, and the technologies used.
          </ContainerLead>
        </ContainerIntro>
      </Container>

      <ContainerContent variant="left">
        <ExperienceTimeline items={items} />
      </ContainerContent>
    </Section>
  )
}

