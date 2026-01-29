export type RichTextBlock =
  | { type: "paragraph"; text?: string | null }
  | { type: "section"; heading?: string | null; items?: Array<{ item: string; id?: string | null }> | null }

export type RichTextContent =
  | { type: "paragraphs"; content: string[] }
  | { type: "list"; items: Array<{ label: string; text?: string; items?: Array<{ label: string; text: string }> }> }
  | { type: "mixed"; sections: RichTextBlock[] }

/**
 * Experience item structure matching the Payload CMS Experience collection.
 * Dates are ISO strings from Payload and need to be formatted for display.
 */
export type ExperienceItem = {
  id: string
  fromDate: string
  toDate?: string | null
  isCurrentRole?: boolean | null
  company: string
  title: string
  content: RichTextContent
  tags: Array<{ id: string; name: string; slug: string }>
  sortOrder?: number | null
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
