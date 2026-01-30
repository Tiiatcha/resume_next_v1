import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components"
import * as React from "react"
import { submitterEmailStyles as styles } from "./email-styles"
import type { EndorsementRelationshipType } from "../app/(app)/endorsements/_components/endorsement-types"

/**
 * Email sent to the endorser when their endorsement is approved.
 *
 * Important:
 * - This email is lifecycle-driven (approval), not submission confirmation.
 * - It is sent only to the endorser (when they provided an email address).
 */

interface EndorsementApprovedEmailProps {
  /**
   * Controls whether this approval is for the original submission or a submitter edit.
   */
  variant?: "approved_initial" | "approved_after_edit"
  endorserName: string
  endorsementText: string
  relationshipType: EndorsementRelationshipType
  viewUrl: string
  publicUrl: string
  /**
   * Set to true when rendering for preview purposes only (e.g., in the browser).
   * When false or undefined (production emails), no default values will be used.
   */
  isPreview?: boolean
}

export const EndorsementApprovedEmail = ({
  variant,
  endorserName,
  endorsementText,
  relationshipType,
  viewUrl,
  publicUrl,
  isPreview = false,
}: EndorsementApprovedEmailProps) => {
  // Apply defaults only for preview mode
  const safeVariant = isPreview ? (variant ?? "approved_initial") : (variant ?? "approved_initial")
  const safeEndorserName = isPreview ? (endorserName || "John Doe") : endorserName
  const safeEndorsementText = isPreview 
    ? (endorsementText || "Craig is an exceptional developer who consistently delivers high-quality work.")
    : endorsementText
  const safeRelationshipType = isPreview ? (relationshipType || "colleague") : relationshipType
  const safeViewUrl = isPreview ? (viewUrl || "https://craigdavison.net/endorsements/view/123") : viewUrl
  const safePublicUrl = isPreview ? (publicUrl || "https://craigdavison.net/endorsements") : publicUrl

  // Validate that in non-preview mode, all required fields are provided
  if (!isPreview) {
    if (!safeEndorserName || !safeEndorsementText || !safeRelationshipType || !safeViewUrl || !safePublicUrl) {
      throw new Error(
        "EndorsementApprovedEmail: All required fields must be provided when not in preview mode"
      )
    }
  }

  const previewText =
    safeVariant === "approved_after_edit"
      ? `Your updated endorsement has been approved — thank you, ${safeEndorserName}`
      : `Your endorsement has been approved — thank you, ${safeEndorserName}`

  const headerTitle =
    safeVariant === "approved_after_edit" ? "Your update is approved" : "It's live — thank you!"
  const headerSubtitle =
    safeVariant === "approved_after_edit"
      ? "Your updated endorsement has been approved"
      : "Your endorsement has been approved"

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>{headerTitle}</Heading>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.paragraph}>Hi {safeEndorserName},</Text>

            <Text style={styles.paragraph}>
              {safeVariant === "approved_after_edit"
                ? "I&apos;ve approved your updated endorsement and the latest version is now eligible to appear on my site. Thanks again for taking the time to keep it up to date — I really appreciate it."
                : "I&apos;ve approved your endorsement and it&apos;s now eligible to appear on my site. Thanks again for taking the time to write it — I really appreciate it."}
            </Text>

            {/* Status highlight */}
            <Section style={styles.statusCardApproved}>
              <Text style={styles.statusCardTitle}>Status: Approved</Text>
              <Text style={styles.statusCardBody}>
                If anything needs tweaking (spelling, clarity, or if you&apos;d like it removed),
                just reply to this email and I&apos;ll sort it.
              </Text>
            </Section>

            {/* Endorsement preview */}
            <Section style={styles.card}>
              <Text style={styles.cardLabel}>Your Endorsement</Text>
              <Text style={styles.quote}>&ldquo;{safeEndorsementText}&rdquo;</Text>
              <Text style={styles.cardMeta}>
                <strong>Relationship:</strong>{" "}
                {safeRelationshipType.charAt(0).toUpperCase() + safeRelationshipType.slice(1)}
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              You can view your endorsement using the button below. You can also view the public
              endorsements page.
            </Text>

            {/* CTA Buttons */}
            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={safeViewUrl}>
                View Your Endorsement
              </Button>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={safePublicUrl}>
                View Endorsements Page
              </Button>
            </Section>

            <Text style={styles.footerText}>
              If you prefer not to have your endorsement displayed publicly, reply to this email
              and I&apos;ll remove it.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.footerSignature}>Best regards,</Text>
            <Text style={styles.footerName}>Craig Davison</Text>
            <Link href="https://craigdavison.net" style={styles.footerLink}>
              craigdavison.net
            </Link>
          </Section>

          {/* Legal Footer */}
          <Section style={styles.legal}>
            <Text style={styles.legalText}>
              This email was sent because you submitted an endorsement at craigdavison.net.
              <br />
              Your email address will never be shared publicly.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EndorsementApprovedEmail
