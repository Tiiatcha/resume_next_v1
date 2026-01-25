import "server-only"

import { cache } from "react"
import { readFile } from "node:fs/promises"
import path from "node:path"

import type { ExperienceItem, ProjectItem, SkillItem } from "@/lib/cv-types"

function getPublicDataPath(relativePath: string) {
  return path.join(process.cwd(), "public", relativePath)
}

async function readJsonFile<T>(relativePathFromPublic: string): Promise<T> {
  const filePath = getPublicDataPath(relativePathFromPublic)
  const rawJson = await readFile(filePath, "utf8")
  return JSON.parse(rawJson) as T
}

/**
 * Server-side data access for the CV.
 *
 * Why filesystem reads?
 * - Keeps data versioned in the repo
 * - Avoids extra client fetch/waterfalls
 * - Great for SEO since pages can render fully server-side
 */
export const getExperienceData = cache(async (): Promise<ExperienceItem[]> => {
  const data = await readJsonFile<unknown>("data/experience.json")
  if (!Array.isArray(data)) {
    throw new Error("Experience data must be a JSON array.")
  }
  return data as ExperienceItem[]
})

export const getProjectsData = cache(async (): Promise<ProjectItem[]> => {
  const data = await readJsonFile<unknown>("data/projects.json")
  if (!Array.isArray(data)) {
    throw new Error("Projects data must be a JSON array.")
  }
  return data as ProjectItem[]
})

export const getSkillsData = cache(async (): Promise<SkillItem[]> => {
  const data = await readJsonFile<unknown>("data/skills.json")
  if (!Array.isArray(data)) {
    throw new Error("Skills data must be a JSON array.")
  }
  return data as SkillItem[]
})
