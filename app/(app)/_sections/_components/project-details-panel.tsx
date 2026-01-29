"use client"

import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import type { ProjectItem } from "@/lib/cv-types"
import { TagList } from "@/components/shared/composites/tag-list"
import { RichText } from "@/components/content/rich-text"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function ProjectDetailSection({
  title,
  value,
}: {
  title: string
  value: ProjectItem["problem"]
}) {
  if (!value) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <RichText value={value} />
    </div>
  )
}

export function ProjectDetailsPanel({
  project,
  onClose,
}: {
  project: ProjectItem | null
  onClose: () => void
}) {
  const isOpen = Boolean(project)

  return (
    <Sheet open={isOpen} onOpenChange={(nextOpen) => (nextOpen ? null : onClose())}>
      <SheetContent>
        <SheetHeader className="space-y-2">
          <SheetTitle>{project ? project.title : "Project details"}</SheetTitle>
          <SheetDescription>
            {project
              ? project.date
              : "Select a project to view the full write-up (problem, solution, impact, and more)."}
          </SheetDescription>

          {project ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {project.type ? (
                <span className="text-muted-foreground">{project.type}</span>
              ) : null}
              {project.role ? (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{project.role}</span>
                </>
              ) : null}
              {project.url ? (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Link
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
                  >
                    Visit
                    <ExternalLinkIcon className="size-3.5" />
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-10">
          {project ? (
            <div className="space-y-6">
              <ProjectDetailSection title="Problem" value={project.problem} />
              <ProjectDetailSection title="Solution" value={project.solution} />
              <ProjectDetailSection title="Management" value={project.management} />
              <ProjectDetailSection title="Impact" value={project.impact} />
              <ProjectDetailSection title="Contribution" value={project.contribution} />

              <div className="space-y-2">
                <p className="text-sm font-medium">Tech</p>
                <TagList tags={project.tags} />
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

