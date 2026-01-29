export type EndorsementRelationshipType =
  | "client"
  | "colleague"
  | "manager"
  | "directReport"
  | "other"

export type EndorsementDisplayPreferences = {
  showNamePublicly?: boolean | null
  showCompanyOrProjectPublicly?: boolean | null
  showLinkedinUrlPublicly?: boolean | null
}

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

