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
  relationshipType: string
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
}

export const EndorsementAdminEmail = ({
  variant = "created",
  endorserName = "John Doe",
  endorserEmail = "john@example.com",
  endorsementText = "Craig is an exceptional developer.",
  relationshipType = "colleague",
  roleOrTitle = "Senior Developer",
  companyOrProject = "Tech Corp",
  linkedinUrl = "https://linkedin.com/in/johndoe",
  consentToPublish = true,
  displayPreferences = {
    showNamePublicly: true,
    showCompanyOrProjectPublicly: true,
    showLinkedinUrlPublicly: false,
  },
  changedFields,
  submissionMeta,
  payloadUrl = "https://craigdavison.net",
  documentId = "123",
}: EndorsementAdminEmailProps) => {
  const previewText =
    variant === "submitter_updated"
      ? `Endorsement updated by ${endorserName}`
      : `New endorsement from ${endorserName}`
  const payloadLink = `${payloadUrl}/admin/collections/endorsements/${documentId}`

  const headerTitle =
    variant === "submitter_updated" ? "✏️ Endorsement Updated" : "🎉 New Endorsement Received"
  const headerSubtitle =
    variant === "submitter_updated"
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
            {variant === "submitter_updated" && changedFields && changedFields.length > 0 ? (
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
                  <td style={styles.valueCell}>{endorserName}</td>
                </tr>
                {endorserEmail && (
                  <tr>
                    <td style={styles.labelCell}>Email:</td>
                    <td style={styles.valueCell}>
                      <Link href={`mailto:${endorserEmail}`} style={styles.link}>
                        {endorserEmail}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={styles.labelCell}>Relationship:</td>
                  <td style={styles.valueCell}>
                    {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
                  </td>
                </tr>
                {roleOrTitle && (
                  <tr>
                    <td style={styles.labelCell}>Role/Title:</td>
                    <td style={styles.valueCell}>{roleOrTitle}</td>
                  </tr>
                )}
                {companyOrProject && (
                  <tr>
                    <td style={styles.labelCell}>Company/Project:</td>
                    <td style={styles.valueCell}>{companyOrProject}</td>
                  </tr>
                )}
                {linkedinUrl && (
                  <tr>
                    <td style={styles.labelCell}>LinkedIn:</td>
                    <td style={styles.valueCell}>
                      <Link href={linkedinUrl} style={styles.link}>
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
              <Text style={styles.quote}>"{endorsementText}"</Text>
            </Section>

            {/* Display Preferences */}
            <Heading style={styles.sectionTitle}>Display Preferences</Heading>
            <table style={styles.detailsTable}>
              <tbody>
                <tr>
                  <td style={styles.labelCell}>Show name publicly:</td>
                  <td style={displayPreferences.showNamePublicly ? styles.successCell : styles.errorCell}>
                    {displayPreferences.showNamePublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Show company/project publicly:</td>
                  <td
                    style={
                      displayPreferences.showCompanyOrProjectPublicly ? styles.successCell : styles.errorCell
                    }
                  >
                    {displayPreferences.showCompanyOrProjectPublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Show LinkedIn publicly:</td>
                  <td
                    style={displayPreferences.showLinkedinUrlPublicly ? styles.successCell : styles.errorCell}
                  >
                    {displayPreferences.showLinkedinUrlPublicly ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                <tr>
                  <td style={styles.labelCell}>Consent to publish:</td>
                  <td style={consentToPublish ? styles.successCell : styles.errorCell}>
                    {consentToPublish ? "✓ Yes" : "✗ No"}
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
