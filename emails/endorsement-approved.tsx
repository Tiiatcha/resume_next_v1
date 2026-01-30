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
  relationshipType: string
  viewUrl: string
  publicUrl: string
}

export const EndorsementApprovedEmail = ({
  variant = "approved_initial",
  endorserName = "John Doe",
  endorsementText = "Craig is an exceptional developer who consistently delivers high-quality work.",
  relationshipType = "colleague",
  viewUrl = "https://craigdavison.net/endorsements/view/123",
  publicUrl = "https://craigdavison.net/endorsements",
}: EndorsementApprovedEmailProps) => {
  const previewText =
    variant === "approved_after_edit"
      ? `Your updated endorsement has been approved — thank you, ${endorserName}`
      : `Your endorsement has been approved — thank you, ${endorserName}`

  const headerTitle =
    variant === "approved_after_edit" ? "Your update is approved" : "It’s live — thank you!"
  const headerSubtitle =
    variant === "approved_after_edit"
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
            <Text style={styles.paragraph}>Hi {endorserName},</Text>

            <Text style={styles.paragraph}>
              {variant === "approved_after_edit"
                ? "I’ve approved your updated endorsement and the latest version is now eligible to appear on my site. Thanks again for taking the time to keep it up to date — I really appreciate it."
                : "I’ve approved your endorsement and it’s now eligible to appear on my site. Thanks again for taking the time to write it — I really appreciate it."}
            </Text>

            {/* Status highlight */}
            <Section style={styles.statusCardApproved}>
              <Text style={styles.statusCardTitle}>Status: Approved</Text>
              <Text style={styles.statusCardBody}>
                If anything needs tweaking (spelling, clarity, or if you’d like it removed),
                just reply to this email and I’ll sort it.
              </Text>
            </Section>

            {/* Endorsement preview */}
            <Section style={styles.card}>
              <Text style={styles.cardLabel}>Your Endorsement</Text>
              <Text style={styles.quote}>&ldquo;{endorsementText}&rdquo;</Text>
              <Text style={styles.cardMeta}>
                <strong>Relationship:</strong>{" "}
                {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
              </Text>
            </Section>

            <Text style={styles.paragraph}>
              You can view your endorsement using the button below. You can also view the public
              endorsements page.
            </Text>

            {/* CTA Buttons */}
            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={viewUrl}>
                View Your Endorsement
              </Button>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={publicUrl}>
                View Endorsements Page
              </Button>
            </Section>

            <Text style={styles.footerText}>
              If you prefer not to have your endorsement displayed publicly, reply to this email
              and I’ll remove it.
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

