import Section from "@/components/shared/layout/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/shared/layout/container"
import { PayloadRichText } from "@/components/content/payload-rich-text"
import type { ExperienceItem, SkillItem } from "@/lib/cv-types"
import { ExperienceTimeline } from "@/app/(app)/_sections/experience-timeline"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

type ExperienceSectionData = {
  eyebrow?: string | null
  heading?: string | null
  sectionIntro?: SerializedEditorState | null
  copy?: SerializedEditorState | null
  sectionClose?: SerializedEditorState | null
}
type ExperienceSectionProps = {
  data?: ExperienceSectionData | null
}

export function ExperienceSection({ items,data }: { items: ExperienceItem[],data?: ExperienceSectionData | null }) {
  const eyebrow = data?.eyebrow ?? null
  const heading = data?.heading ?? null
  const sectionIntro = data?.sectionIntro ?? null
  return (
    <Section id="experience" glow={{ side: "left", tone: "warm" }}>
      <Container variant="left">
        <ContainerIntro variant="left">
          <ContainerEyebrow>{eyebrow}</ContainerEyebrow>
          <ContainerTitle>{heading}</ContainerTitle>
          <ContainerLead>
            <PayloadRichText 
              data={sectionIntro ?? data?.sectionIntro ?? null}
              className="section-introtext-muted-foreground text-pretty text-lg leading-relaxed" 
              />
          </ContainerLead>
        </ContainerIntro>
        <ContainerContent variant="left">
          <ExperienceTimeline items={items}  />
        </ContainerContent>
      </Container>

    </Section>
  )
}

