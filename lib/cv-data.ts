import "server-only"

import { cache } from "react"
import { readFile } from "node:fs/promises"
import path from "node:path"

import type { ExperienceItem, ProjectItem, SkillItem } from "@/lib/cv-types"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import type { Experience, Tag } from "@/payload-types"

function getPublicDataPath(relativePath: string) {
  return path.join(process.cwd(), "public", relativePath)
}

async function readJsonFile<T>(relativePathFromPublic: string): Promise<T> {
  const filePath = getPublicDataPath(relativePathFromPublic)
  const rawJson = await readFile(filePath, "utf8")
  return JSON.parse(rawJson) as T
}

/**
 * Transforms a Payload Experience document into the ExperienceItem type
 * used by the CV components.
 *
 * Handles:
 * - Extracting tag names from populated Tag relationships
 * - Converting Payload's items structure ({item: string}[]) to the expected format
 */
function transformPayloadExperience(experience: Experience): ExperienceItem {
  // Extract tag data (handle both populated and unpopulated tags)
  const tags = (experience.tags ?? []).map((tag) => {
    if (typeof tag === "string") {
      // Tag is just an ID (shouldn't happen with depth: 1, but handle it)
      return { id: tag, name: tag, slug: tag }
    }
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }
  })

  // Transform the content sections to match the expected structure
  const sections = experience.content.sections.map((section) => {
    if (section.type === "paragraph") {
      return {
        type: "paragraph" as const,
        text: section.text ?? null,
      }
    }

    return {
      type: "section" as const,
      heading: section.heading ?? null,
      items: section.items ?? null,
    }
  })

  return {
    id: experience.id,
    fromDate: experience.fromDate,
    toDate: experience.toDate ?? null,
    isCurrentRole: experience.isCurrentRole ?? null,
    company: experience.company,
    title: experience.title,
    content: {
      type: "mixed",
      sections,
    },
    tags,
    sortOrder: experience.sortOrder ?? null,
  }
}

/**
 * Server-side data access for the CV.
 *
 * Experience data is now fetched from Payload CMS instead of JSON files.
 * This provides:
 * - A content management UI for non-technical updates
 * - Structured data validation
 * - Relationship management for tags
 * - Better date handling
 *
 * Data is cached per request for optimal performance.
 */
export const getExperienceData = cache(async (): Promise<ExperienceItem[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: "experiences",
    depth: 1, // Populate tags one level deep
    limit: 100, // Reasonable limit for CV experiences
    sort: "-fromDate", // Most recent first
  })

  return result.docs.map(transformPayloadExperience)
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
