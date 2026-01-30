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
import { adminEmailStyles as styles } from "./email-styles"
import type { EndorsementRelationshipType } from "../app/(app)/endorsements/_components/endorsement-types"

/**
 * Email sent to admin (Craig) when a new endorsement is submitted.
 * 
 * Built with react-email for maximum compatibility across email clients.
 */

interface EndorsementAdminEmailProps {
  /**
   * Controls copy for initial submission vs submitter-driven updates.
   */
  variant?: "created" | "submitter_updated"
  endorserName: string
  endorserEmail?: string
  endorsementText: string
  relationshipType: EndorsementRelationshipType
  roleOrTitle?: string
  companyOrProject?: string
  linkedinUrl?: string
  consentToPublish: boolean
  displayPreferences: {
    showNamePublicly: boolean
    showCompanyOrProjectPublicly: boolean
    showLinkedinUrlPublicly: boolean
  }
  /**
   * Optional summary of what changed on a submitter edit.
   * This is computed server-side in the collection hook.
   */
  changedFields?: Array<{
    field: string
    previous: string
    next: string
  }>
  submissionMeta?: {
    ipAddress?: string | null
    userAgent?: string | null
  }
  payloadUrl: string
  documentId: string
  /**
   * Set to true when rendering for preview purposes only (e.g., in the browser).
   * When false or undefined (production emails), no default values will be used.
   */
  isPreview?: boolean
}

export const EndorsementAdminEmail = ({
  variant,
  endorserName,
  endorserEmail,
  endorsementText,
  relationshipType,
  roleOrTitle,
  companyOrProject,
  linkedinUrl,
  consentToPublish,
  displayPreferences,
  changedFields,
  submissionMeta,
  payloadUrl,
  documentId,
  isPreview = false,
}: EndorsementAdminEmailProps) => {
  // Apply defaults only for preview mode
  const safeVariant = isPreview ? (variant ?? "created") : (variant ?? "created")
  const safeEndorserName = isPreview ? (endorserName || "John Doe") : endorserName
  const safeEndorserEmail = isPreview ? (endorserEmail || "john@example.com") : (endorserEmail || "")
  const safeEndorsementText = isPreview
    ? (endorsementText || "Craig is an exceptional developer.")
    : endorsementText
  const safeRelationshipType = isPreview ? (relationshipType || "colleague") : relationshipType
  const safeRoleOrTitle = isPreview ? (roleOrTitle || "Senior Developer") : (roleOrTitle || "")
  const safeCompanyOrProject = isPreview ? (companyOrProject || "Tech Corp") : (companyOrProject || "")
  const safeLinkedinUrl = isPreview ? (linkedinUrl || "https://linkedin.com/in/johndoe") : (linkedinUrl || "")
  const safeConsentToPublish = consentToPublish !== undefined ? consentToPublish : (isPreview ? true : false)
  const safeDisplayPreferences = displayPreferences || {
    showNamePublicly: isPreview ? true : false,
    showCompanyOrProjectPublicly: isPreview ? true : false,
    showLinkedinUrlPublicly: isPreview ? false : false,
  }
  const safePayloadUrl = isPreview ? (payloadUrl || "https://craigdavison.net") : payloadUrl
  const safeDocumentId = isPreview ? (documentId || "123") : documentId

  // Validate that in non-preview mode, all required fields are provided
  if (!isPreview) {
    if (
      !safeEndorserName ||
      !safeEndorsementText ||
      !safeRelationshipType ||
      !safePayloadUrl ||
      !safeDocumentId ||
      safeConsentToPublish === undefined
    ) {
      throw new Error(
        "EndorsementAdminEmail: All required fields must be provided when not in preview mode"
      )
    }
  }

  const previewText =
    safeVariant === "submitter_updated"
      ? `Endorsement updated by ${safeEndorserName}`
      : `New endorsement from ${safeEndorserName}`
  const payloadLink = `${safePayloadUrl}/admin/collections/endorsements/${safeDocumentId}`

  const headerTitle =
    safeVariant === "submitter_updated" ? "✏️ Endorsement Updated" : "🎉 New Endorsement Received"
  const headerSubtitle =
    safeVariant === "submitter_updated"
      ? "A submitter updated their endorsement — it needs review"
      : "A new endorsement is waiting for your review"

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

          {/* Quick Action */}
          <Section style={styles.quickAction}>
            <Button style={styles.button} href={payloadLink}>
              Review in Payload →
            </Button>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {safeVariant === "submitter_updated" && changedFields && changedFields.length > 0 ? (
              <>
                <Heading style={styles.sectionTitle}>What changed</Heading>
                <table style={styles.detailsTable}>
                  <tbody>
                    {changedFields.map((item) => (
                      <tr key={item.field}>
                        <td style={styles.labelCell}>{item.field}:</td>
                        <td style={styles.valueCell}>
                          <Text style={{ margin: "0 0 6px" }}>
                            <strong>Before:</strong> {item.previous}
                          </Text>
                          <Text style={{ margin: "0" }}>
                            <strong>After:</strong> {item.next}
                          </Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}

            {/* Endorser Details */}
            <Heading style={styles.sectionTitle}>Endorser Information</Heading>
            <table style={styles.detailsTable}>
              <tbody>
                <tr>
                  <td style={styles.labelCell}>Name:</td>
                  <td style={styles.valueCell}>{safeEndorserName}</td>
                </tr>
                {safeEndorserEmail && (
                  <tr>
                    <td style={styles.labelCell}>Email:</td>
                    <td style={styles.valueCell}>
                      <Link href={`mailto:${safeEndorserEmail}`} style={styles.link}>
                        {safeEndorserEmail}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={styles.labelCell}>Relationship:</td>
                  <td style={styles.valueCell}>
                    {safeRelationshipType.charAt(0).toUpperCase() + safeRelationshipType.slice(1)}
                  </td>
                </tr>
                {safeRoleOrTitle && (
                  <tr>
                    <td style={styles.labelCell}>Role/Title:</td>
                    <td style={styles.valueCell}>{safeRoleOrTitle}</td>
                  </tr>
                )}
                {safeCompanyOrProject && (
                  <tr>
                    <td style={styles.labelCell}>Company/Project:</td>
                    <td style={styles.valueCell}>{safeCompanyOrProject}</td>
                  </tr>
                )}
                {safeLinkedinUrl && (
                  <tr>
                    <td style={styles.labelCell}>LinkedIn:</td>
                    <td style={styles.valueCell}>
                      <Link href={safeLinkedinUrl} style={styles.link}>
                        View Profile
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Endorsement Text */}
            <Heading style={styles.sectionTitle}>Endorsement</Heading>
            <Section style={styles.quoteCard}>
              <Text style={styles.quote}>&ldquo;{safeEndorsementText}&rdquo;</Text>
            </Section>

            {/* Display Preferences */}
            <Heading style={styles.sectionTitle}>Display Preferences</Heading>
            <table style={styles.detailsTable}>
              <tbody>
                <tr>
                  <td style={styles.labelCell}>Show name publicly:</td>
                  <td style={safeDisplayPreferences.showNamePublicly ? styles.successCell : styles.errorCell}>
                    {safeDisplayPreferences.showNamePublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Show company/project publicly:</td>
                  <td
                    style={
                      safeDisplayPreferences.showCompanyOrProjectPublicly ? styles.successCell : styles.errorCell
                    }
                  >
                    {safeDisplayPreferences.showCompanyOrProjectPublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Show LinkedIn publicly:</td>
                  <td
                    style={safeDisplayPreferences.showLinkedinUrlPublicly ? styles.successCell : styles.errorCell}
                  >
                    {safeDisplayPreferences.showLinkedinUrlPublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Consent to publish:</td>
                  <td style={safeConsentToPublish ? styles.successCell : styles.errorCell}>
                    {safeConsentToPublish ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Submission Meta */}
            {submissionMeta && (submissionMeta.ipAddress || submissionMeta.userAgent) && (
              <>
                <Heading style={styles.sectionTitle}>Submission Metadata</Heading>
                <table style={styles.detailsTable}>
                  <tbody>
                    {submissionMeta.ipAddress && (
                      <tr>
                        <td style={styles.labelCell}>IP Address:</td>
                        <td style={styles.metaCell}>{submissionMeta.ipAddress}</td>
                      </tr>
                    )}
                    {submissionMeta.userAgent && (
                      <tr>
                        <td style={styles.labelCell}>User Agent:</td>
                        <td style={styles.metaCell}>{submissionMeta.userAgent}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </Section>

          {/* Footer CTA */}
          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.footerText}>Ready to approve or edit this endorsement?</Text>
            <Button style={styles.button} href={payloadLink}>
              Open in Payload CMS
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EndorsementAdminEmail
