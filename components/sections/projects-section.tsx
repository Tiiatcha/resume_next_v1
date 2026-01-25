"use client"

import * as React from "react"

import Section from "@/components/sections/components/section"
import { ProjectCard } from "@/components/cards/project-card"
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

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  const [activeProject, setActiveProject] = React.useState<ProjectItem | null>(
    null
  )

  function getProjectKey(project: ProjectItem) {
    return `${project.title}-${project.date}`
  }

  const selectedProjects = React.useMemo(
    () => items.filter((project) => project.status !== "decommissioned"),
    [items]
  )

  const archivedProjects = React.useMemo(
    () => items.filter((project) => project.status === "decommissioned"),
    [items]
  )

  return (
    <Section id="projects" glow={{ side: "left", tone: "warm" }}>
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {selectedProjects.map((item) => {
              const projectKey = getProjectKey(item)
              const isActive =
                activeProject ? getProjectKey(activeProject) === projectKey : false

              return (
                <ProjectCard
                  key={projectKey}
                  item={item}
                  isActive={isActive}
                  onOpenDetails={setActiveProject}
                />
              )
            })}
          </div>

          {archivedProjects.length ? (
            <div className="mt-6">
              <Accordion type="single" collapsible>
                <AccordionItem value="archived-projects">
                  <AccordionTrigger>
                    Archived ({archivedProjects.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {archivedProjects.map((item) => {
                        const projectKey = getProjectKey(item)
                        const isActive = activeProject
                          ? getProjectKey(activeProject) === projectKey
                          : false

                        return (
                          <ProjectCard
                            key={projectKey}
                            item={item}
                            isActive={isActive}
                            onOpenDetails={setActiveProject}
                          />
                        )
                      })}
                    </div>
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

