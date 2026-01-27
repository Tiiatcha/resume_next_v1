"use client"

import type { EndorsementSummary } from "@/components/sections/endorsements-types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/**
 * Side panel that displays the full endorsement text and details.
 * 
 * Follows the same pattern as ProjectDetailsPanel for consistency.
 */
export function EndorsementDetailsPanel({
  endorsement,
  onClose,
}: {
  endorsement: EndorsementSummary | null
  /**
   * Called when the sheet should close (backdrop click, close button, ESC, etc.).
   */
  onClose: () => void
}) {
  const isOpen = Boolean(endorsement)

  if (!endorsement) {
    return null
  }

  const preferences = endorsement.displayPreferences ?? {}
  const showName = preferences.showNamePublicly ?? true
  const showLinkedIn = preferences.showLinkedinUrlPublicly ?? false

  const nameLabel =
    showName && endorsement.endorserName
      ? endorsement.endorserName
      : "Name withheld"

  // Build relationship line
  const relationshipParts: string[] = []
  
  if (endorsement.relationshipType) {
    const labelByType: Record<string, string> = {
      client: "Client",
      colleague: "Colleague",
      manager: "Manager",
      directReport: "Direct report",
      other: "Collaborator",
    }
    relationshipParts.push(labelByType[endorsement.relationshipType] ?? "Collaborator")
  }

  if (endorsement.roleOrTitle) {
    relationshipParts.push(endorsement.roleOrTitle)
  }

  if (preferences.showCompanyOrProjectPublicly ?? true) {
    if (endorsement.companyOrProject) {
      relationshipParts.push(endorsement.companyOrProject)
    }
  }

  const relationshipLine =
    relationshipParts.length > 0 ? relationshipParts.join(" • ") : null

  return (
    <Sheet open={isOpen} onOpenChange={(nextOpen) => (nextOpen ? null : onClose())}>
      <SheetContent>
        <SheetHeader className="space-y-2">
          <SheetTitle>{nameLabel}</SheetTitle>
          {relationshipLine ? (
            <SheetDescription>{relationshipLine}</SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-10">
          <div className="space-y-4">
            <p className="text-pretty text-sm leading-relaxed">
              {endorsement.endorsementText}
            </p>

            {showLinkedIn && endorsement.linkedinUrl ? (
              <p className="text-muted-foreground text-xs">
                <a
                  href={endorsement.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:no-underline"
                >
                  View LinkedIn profile
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
