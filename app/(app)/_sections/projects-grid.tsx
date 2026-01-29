"use client"

import * as React from "react"

import { Reveal } from "@/components/shared/motion/reveal"
import { ProjectCard } from "@/app/(app)/_sections/_components/project-card"
import { CardContainer } from "@/components/shared/layout/grid"
import type { ProjectItem } from "@/lib/cv-types"

function getProjectKey(project: ProjectItem) {
  return `${project.title}-${project.date}`
}

export function ProjectsGrid({
  items,
  activeProject,
  onOpenDetails,
  className,
}: {
  items: ProjectItem[]
  activeProject: ProjectItem | null
  onOpenDetails: (project: ProjectItem) => void
  className?: string
}) {
  return (
    <div className={["grid gap-4 sm:grid-cols-2", className].filter(Boolean).join(" ")}>
      {items.map((item) => {
        const projectKey = getProjectKey(item)
        const isActive = activeProject
          ? getProjectKey(activeProject) === projectKey
          : false

        return (
          <CardContainer key={projectKey}>
            <Reveal className="grid grid-rows-subgrid row-span-4">
              <ProjectCard
                item={item}
                isActive={isActive}
                onOpenDetails={onOpenDetails}
                className="grid grid-rows-subgrid row-span-4"
              />
            </Reveal>
          </CardContainer>
        )
      })}
    </div>
  )
}

