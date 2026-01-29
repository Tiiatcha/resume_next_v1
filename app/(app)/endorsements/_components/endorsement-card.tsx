'use client'

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/shared/motion/reveal"
import type {
  EndorsementRelationshipType,
  EndorsementSummary,
} from "@/app/(app)/endorsements/_components/endorsement-types"

interface EndorsementCardProps {
  /**
   * The endorsement data to display in the summary card.
   */
  endorsement: EndorsementSummary

  /**
   * Optional reveal delay so lists can stagger their entrance animations.
   */
  delaySeconds?: number

  /**
   * Opens the side-panel / sheet showing the full endorsement.
   * 
   * If omitted, the "Read more" button will not be rendered.
   */
  onOpenDetails?: (endorsement: EndorsementSummary) => void
}

/**
 * Truncate long endorsement text for the grid view while keeping word
 * boundaries intact so the preview reads naturally.
 */
function truncateEndorsementText(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input
  }

  const shortened = input.slice(0, maxLength)
  const lastSpaceIndex = shortened.lastIndexOf(" ")
  const safeCutIndex = lastSpaceIndex > 40 ? lastSpaceIndex : maxLength

  return `${shortened.slice(0, safeCutIndex).trimEnd()}…`
}

function buildRelationshipLine(
  endorsement: EndorsementSummary,
): string | null {
  const relationshipParts: string[] = []

  if (endorsement.relationshipType) {
    const labelByType: Record<EndorsementRelationshipType, string> = {
      client: "Client",
      colleague: "Colleague",
      manager: "Manager",
      directReport: "Direct report",
      other: "Collaborator",
    }

    const relationshipLabel =
      labelByType[endorsement.relationshipType] ?? "Collaborator"

    relationshipParts.push(relationshipLabel)
  }

  if (endorsement.roleOrTitle) {
    relationshipParts.push(endorsement.roleOrTitle)
  }

  if (endorsement.displayPreferences?.showCompanyOrProjectPublicly ?? true) {
    if (endorsement.companyOrProject) {
      relationshipParts.push(endorsement.companyOrProject)
    }
  }

  if (relationshipParts.length === 0) {
    return null
  }

  return relationshipParts.join(" • ")
}

/**
 * Presentational card for a single endorsement with an inline preview.
 * 
 * Follows the same pattern as ProjectCard - clicking "Read more" triggers
 * the onOpenDetails callback to show the full endorsement in a side panel.
 */
export function EndorsementCard({
  endorsement,
  delaySeconds = 0,
  onOpenDetails,
}: EndorsementCardProps): React.JSX.Element {
  const preferences = endorsement.displayPreferences ?? {}

  const showName = preferences.showNamePublicly ?? true
  const nameLabel =
    showName && endorsement.endorserName
      ? endorsement.endorserName
      : "Name withheld"

  const relationshipLine = buildRelationshipLine(endorsement)

  const fullText = endorsement.endorsementText
  const previewText = truncateEndorsementText(fullText, 200)
  const isTruncated = previewText !== fullText

  return (
    <Reveal delaySeconds={delaySeconds}>
      <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{nameLabel}</CardTitle>
          {relationshipLine ? (
            <p className="text-muted-foreground text-xs">
              {relationshipLine}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p className="text-pretty">
            {previewText}{" "}
            {isTruncated && onOpenDetails ? (
              <button
                type="button"
                onClick={() => onOpenDetails(endorsement)}
                className="cursor-pointer text-xs font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                Read more
              </button>
            ) : null}
          </p>
        </CardContent>
      </Card>
    </Reveal>
  )
}

