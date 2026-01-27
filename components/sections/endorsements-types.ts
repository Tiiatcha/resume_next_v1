'use client'

/**
 * Enumerates the types of working relationships that an endorser can have.
 *
 * Kept in a shared module so both the section and card components can
 * reference the same source of truth without circular dependencies.
 */
export type EndorsementRelationshipType =
  | "client"
  | "colleague"
  | "manager"
  | "directReport"
  | "other"

/**
 * Controls which pieces of the endorser's identity can be shown publicly.
 */
export type EndorsementDisplayPreferences = {
  showNamePublicly?: boolean | null
  showCompanyOrProjectPublicly?: boolean | null
  showLinkedinUrlPublicly?: boolean | null
}

/**
 * Minimal endorsement data required to render summaries and detail views
 * on the public CV site.
 */
export type EndorsementSummary = {
  id: string
  endorsementText: string
  endorserName?: string | null
  relationshipType?: EndorsementRelationshipType | null
  roleOrTitle?: string | null
  companyOrProject?: string | null
  linkedinUrl?: string | null
  displayPreferences?: EndorsementDisplayPreferences | null
}

