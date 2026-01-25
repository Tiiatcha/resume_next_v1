"use client"

import * as React from "react"

import Section from "@/components/sections/components/section"
import { ProjectDetailsPanel } from "@/components/panels/project-details-panel"
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
} from "@/components/sections/components/container"
import { ProjectsGrid } from "@/components/sections/projects-grid"

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
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
          <ContainerEyebrow>Projects</ContainerEyebrow>
          <ContainerTitle>Selected work</ContainerTitle>
          <ContainerLead>
            A curated mix of client work and larger initiatives. Archived projects are
            available below.
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

