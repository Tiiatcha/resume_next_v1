import { Section, SectionHeading } from "@/components/primitives/section"
import type { ExperienceItem } from "@/lib/cv-types"
import { ExperienceTimeline } from "@/components/sections/experience-timeline"

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Experience"
        title="Recent roles and responsibilities"
        description="A quick overview of positions, impact, and the technologies used."
      />

      <ExperienceTimeline items={items} />
    </Section>
  )
}

