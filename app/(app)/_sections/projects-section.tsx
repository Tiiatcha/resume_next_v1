"use client"

import * as React from "react"

import Section from "@/components/shared/layout/section"
import { ProjectDetailsPanel } from "@/app/(app)/_sections/_components/project-details-panel"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ProjectItem } from "@/lib/cv-types"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/shared/layout/container"
import { ProjectsGrid } from "@/app/(app)/_sections/projects-grid"
import { PayloadRichText } from "@/components/content/payload-rich-text"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

type ProjectsSectionData = {
  eyebrow?: string | null
  heading?: string | null
  sectionIntro?: SerializedEditorState | null
  copy?: SerializedEditorState | null
  sectionClose?: SerializedEditorState | null
}

export function ProjectsSection({ items,data }: { items: ProjectItem[],data?: ProjectsSectionData | null }) {
  const eyebrow = data?.eyebrow ?? null
  const heading = data?.heading ?? null
  const sectionIntro = data?.sectionIntro ?? null
  

  const [activeProject, setActiveProject] = React.useState<ProjectItem | null>(
    null
  )

  const selectedProjects = React.useMemo(
    () => items.filter((project) => project.status !== "decommissioned"),
    [items]
  )

  const archivedProjects = React.useMemo(
    () => items.filter((project) => project.status === "decommissioned"),
    [items]
  )

  return (
    <Section id="projects" surface="featured" glow={{ side: "right", tone: "cool" }}>
      <Container variant="left">
        <ContainerIntro variant="left">
          <ContainerEyebrow>{eyebrow}</ContainerEyebrow>
          <ContainerTitle>{heading}</ContainerTitle>
          <ContainerLead>
            <PayloadRichText 
              data={sectionIntro}
              className="section-intro text-muted-foreground text-pretty text-lg leading-relaxed" 
              />
          </ContainerLead>
        </ContainerIntro>
        <ContainerContent variant="left">
          <div className="mt-6">
            <ProjectsGrid
              items={selectedProjects}
              activeProject={activeProject}
              onOpenDetails={setActiveProject}
            />
          </div>

          {archivedProjects.length ? (
            <div className="mt-6 w-full">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="archived-projects">
                  <AccordionTrigger>
                    Archived ({archivedProjects.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <ProjectsGrid
                      items={archivedProjects}
                      activeProject={activeProject}
                      onOpenDetails={setActiveProject}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : null}

          <ProjectDetailsPanel
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        </ContainerContent>
      </Container>

    </Section>
  )
}

