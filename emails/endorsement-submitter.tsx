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

/**
 * Email sent to endorsement submitter after they submit an endorsement.
 * 
 * @param {string} endorserName - The name of the endorser.
 * @param {string} endorsementText - The text of the endorsement.
 * @param {string} relationshipType - The relationship type of the endorser.
 * @param {string} viewUrl - The URL to view the endorsement.
 */

interface EndorsementSubmitterEmailProps {
  /**
   * Controls copy for initial submission vs submitter-driven edits.
   */
  variant?: "created" | "updated" | "admin_edited_notice"
  endorserName: string
  endorsementText: string
  relationshipType: string
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
}

export const EndorsementSubmitterEmail = ({
  variant = "created",
  endorserName = "John Doe",
  endorsementText = "Craig is an exceptional developer who consistently delivers high-quality work.",
  relationshipType = "colleague",
  viewUrl = "https://craigdavison.net/endorsements/view/123",
  changedFields,
}: EndorsementSubmitterEmailProps) => {
  const previewText =
    variant === "updated"
      ? `We received your endorsement update, ${endorserName}`
      : variant === "admin_edited_notice"
        ? `A small update was made to your endorsement, ${endorserName}`
      : `Thank you for your endorsement, ${endorserName}`

  const headerTitle =
    variant === "updated"
      ? `Update received, ${endorserName}`
      : variant === "admin_edited_notice"
        ? `A small update, ${endorserName}`
        : `Thank You, ${endorserName}`
  const headerSubtitle =
    variant === "updated"
      ? "Your endorsement update is now under review"
      : variant === "admin_edited_notice"
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
            <Text style={styles.paragraph}>Hi {endorserName},</Text>
            
            <Text style={styles.paragraph}>
              {variant === "updated"
                ? "Thanks for taking the time to update your endorsement. Your changes have been saved and will be reviewed again before appearing on the public site."
                : variant === "admin_edited_notice"
                  ? "I made a small edit to your endorsement for clarity/spelling. If you’d like to tweak anything (or prefer the original wording), you can update it using the link below."
                : "Thank you so much for taking the time to share your thoughts about working together. Your endorsement means a great deal and will help future employers and clients understand the value of collaboration."}
            </Text>

            {variant === "admin_edited_notice" && changedFields && changedFields.length > 0 ? (
              <Section style={styles.card}>
                <Text style={styles.cardLabel}>What changed</Text>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    {changedFields.map((item) => (
                      <tr key={item.field}>
                        <td
                          style={{
                            padding: "8px 0",
                            color: "#718096",
                            fontSize: "14px",
                            fontWeight: 600,
                            width: "34%",
                            verticalAlign: "top",
                          }}
                        >
                          {item.field}
                        </td>
                        <td style={{ padding: "8px 0", color: "#2d3748", fontSize: "14px" }}>
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
              <Text style={styles.quote}>&ldquo;{endorsementText}&rdquo;</Text>
              <Text style={styles.cardMeta}>
                <strong>Relationship:</strong>{" "}
                {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              {variant === "updated"
                ? "Your updated endorsement is now pending review. Once approved, the latest version will be displayed on the public CV site."
                : variant === "admin_edited_notice"
                  ? "If you’re happy with the change, you don’t need to do anything. If you’d like to adjust it, your update will go back into review before it’s shown publicly."
                  : "Your endorsement is currently pending review. Once approved, it will be displayed on the public CV site."}{" "}
              You can view your endorsement (or request changes) at any time using the link below:
            </Text>

            {/* CTA Button */}
            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={viewUrl}>
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
