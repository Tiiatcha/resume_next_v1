'use client'

import * as React from "react"

import type { EndorsementSummary } from "@/app/(app)/endorsements/_components/endorsement-types"
import { EndorsementCard } from "@/app/(app)/endorsements/_components/endorsement-card"
import { EndorsementDetailsPanel } from "@/app/(app)/endorsements/_components/endorsement-details-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PublicEndorsementPreviewProps {
  /**
   * Publicly-visible endorsement data.
   *
   * This must match what is already visible on the endorsements section:
   * - Only approved endorsements
   * - Only fields permitted by display preferences
   */
  endorsement: EndorsementSummary | null
}

/**
 * Public preview shown before OTP verification.
 *
 * This intentionally displays ONLY what is already available on the public endorsements
 * section, so a forwarded link cannot expose private details.
 */
export function PublicEndorsementPreview({
  endorsement,
}: PublicEndorsementPreviewProps): React.JSX.Element {
  const [activeEndorsement, setActiveEndorsement] = React.useState<EndorsementSummary | null>(null)

  if (!endorsement) {
    return (
      <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
        <CardHeader>
          <CardTitle className="text-base">This endorsement is not public yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Until your endorsement is approved, we don’t display it publicly.
            To view or edit your full submission, verify your email below.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <EndorsementCard endorsement={endorsement} onOpenDetails={setActiveEndorsement} />
      <EndorsementDetailsPanel
        endorsement={activeEndorsement}
        onClose={() => setActiveEndorsement(null)}
      />
    </>
  )
}

