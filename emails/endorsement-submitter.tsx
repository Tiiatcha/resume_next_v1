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
 * Email sent to endorsement submitter after they submit an endorsement.
 * 
 * @param {string} endorserName - The name of the endorser.
 * @param {string} endorsementText - The text of the endorsement.
 * @param {EndorsementRelationshipType} relationshipType - The relationship type of the endorser.
 * @param {string} viewUrl - The URL to view the endorsement.
 */

interface EndorsementSubmitterEmailProps {
  /**
   * Controls copy for initial submission vs submitter-driven edits.
   */
  variant?: "created" | "updated" | "admin_edited_notice"
  endorserName: string
  endorsementText: string
  relationshipType: EndorsementRelationshipType
  viewUrl: string
  /**
   * Optional summary of changes (used when notifying submitter about admin edits).
   *
   * This is computed server-side in the endorsements collection hook and is intentionally
   * concise (truncated text, limited fields) to keep the email readable.
   */
  changedFields?: Array<{
    field: string
    previous: string
    next: string
  }>
  /**
   * Set to true when rendering for preview purposes only (e.g., in the browser).
   * When false or undefined (production emails), no default values will be used.
   */
  isPreview?: boolean
}

export const EndorsementSubmitterEmail = ({
  variant,
  endorserName,
  endorsementText,
  relationshipType,
  viewUrl,
  changedFields,
  isPreview = false,
}: EndorsementSubmitterEmailProps) => {
  // Apply defaults only for preview mode
  const safeVariant = isPreview ? (variant ?? "created") : (variant ?? "created")
  const safeEndorserName = isPreview ? (endorserName || "John Doe") : endorserName
  const safeEndorsementText = isPreview 
    ? (endorsementText || "Craig is an exceptional developer who consistently delivers high-quality work.")
    : endorsementText
  const safeRelationshipType = isPreview ? (relationshipType || "colleague") : relationshipType
  const safeViewUrl = isPreview ? (viewUrl || "https://craigdavison.net/endorsements/view/123") : viewUrl

  // Validate that in non-preview mode, all required fields are provided
  if (!isPreview) {
    if (!safeEndorserName || !safeEndorsementText || !safeRelationshipType || !safeViewUrl) {
      throw new Error(
        "EndorsementSubmitterEmail: All required fields must be provided when not in preview mode"
      )
    }
  }

  const previewText =
    safeVariant === "updated"
      ? `We received your endorsement update, ${safeEndorserName}`
      : safeVariant === "admin_edited_notice"
        ? `A small update was made to your endorsement, ${safeEndorserName}`
      : `Thank you for your endorsement, ${safeEndorserName}`

  const headerTitle =
    safeVariant === "updated"
      ? `Update received, ${safeEndorserName}`
      : safeVariant === "admin_edited_notice"
        ? `A small update, ${safeEndorserName}`
        : `Thank You, ${safeEndorserName}`
  const headerSubtitle =
    safeVariant === "updated"
      ? "Your endorsement update is now under review"
      : safeVariant === "admin_edited_notice"
        ? "Craig made a small edit for clarity"
        : "Your endorsement has been received"

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
              {safeVariant === "updated"
                ? "Thanks for taking the time to update your endorsement. Your changes have been saved and will be reviewed again before appearing on the public site."
                : safeVariant === "admin_edited_notice"
                  ? "I made a small edit to your endorsement for clarity/spelling. If you'd like to tweak anything (or prefer the original wording), you can update it using the link below."
                : "Thank you so much for taking the time to share your thoughts about working together. Your endorsement means a great deal and will help future employers and clients understand the value of collaboration."}
            </Text>

            {safeVariant === "admin_edited_notice" && changedFields && changedFields.length > 0 ? (
              <Section style={styles.card}>
                <Text style={styles.cardLabel}>What changed</Text>
                <table
                  style={styles.detailsTable}
                >
                  <tbody>
                    {changedFields.map((item) => (
                      <tr key={item.field}>
                        <td
                          style={styles.detailsLabelCell}
                        >
                          {item.field}
                        </td>
                        <td style={styles.detailsValueCell}>
                          <Text style={{ margin: "0 0 6px", lineHeight: "1.6" }}>
                            <strong>Before:</strong> {item.previous}
                          </Text>
                          <Text style={{ margin: "0", lineHeight: "1.6" }}>
                            <strong>After:</strong> {item.next}
                          </Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            ) : null}

            {/* Endorsement Preview Card */}
            <Section style={styles.card}>
              <Text style={styles.cardLabel}>Your Endorsement</Text>
              <Text style={styles.quote}>&ldquo;{safeEndorsementText}&rdquo;</Text>
              <Text style={styles.cardMeta}>
                <strong>Relationship:</strong>{" "}
                {safeRelationshipType.charAt(0).toUpperCase() + safeRelationshipType.slice(1)}
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              {safeVariant === "updated"
                ? "Your updated endorsement is now pending review. Once approved, the latest version will be displayed on the public CV site."
                : safeVariant === "admin_edited_notice"
                  ? "If you're happy with the change, you don't need to do anything. If you'd like to adjust it, your update will go back into review before it's shown publicly."
                  : "Your endorsement is currently pending review. Once approved, it will be displayed on the public CV site."}{" "}
              You can view your endorsement (or request changes) at any time using the link below:
            </Text>

            {/* CTA Button */}
            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={safeViewUrl}>
                View Your Endorsement
              </Button>
            </Section>

            <Text style={styles.footerText}>
              If you need to update or remove your endorsement again, please reply to this email
              or use the link above.
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

export default EndorsementSubmitterEmail
