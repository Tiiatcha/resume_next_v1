export type RichTextBlock =
  | { type: "paragraph"; text: string }
  | { type: "section"; heading: string; items: string[] }

export type RichTextContent =
  | { type: "paragraphs"; content: string[] }
  | { type: "list"; items: Array<{ label: string; text?: string; items?: Array<{ label: string; text: string }> }> }
  | { type: "mixed"; sections: RichTextBlock[] }

export type ExperienceItem = {
  from: string
  to: string
  company: string
  title: string
  content: RichTextContent
  tags: string[]
}

export type ProjectStatus = "active" | "completed" | "decommissioned"

export type ProjectItem = {
  date: string
  title: string
  url?: string
  /**
   * Lifecycle indicator for the project.
   *
   * - "active": still maintained / currently live
   * - "completed": finished work (still representative, not actively maintained)
   * - "decommissioned": intentionally retired / taken offline
   */
  status?: ProjectStatus
  role?: string
  type?: string
  problem?: RichTextContent | null
  solution?: RichTextContent | null
  management?: RichTextContent | null
  impact?: RichTextContent | null
  contribution?: RichTextContent | null
  tags: string[]
}


export type SkillItem = {
  /** Display label, e.g. "TypeScript" */
  name: string
  /** Self-assessed level (0-100) */
  level: number
}
