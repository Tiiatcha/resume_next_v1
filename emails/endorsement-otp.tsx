import {
  Body,
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

interface EndorsementOtpEmailProps {
  endorserName: string
  otpCode: string
  expiresInMinutes: number
  manageUrl: string
}

/**
 * OTP email for endorsement self-service (edit/delete).
 *
 * The OTP is short-lived and should never be shared.
 * This is intentionally simple and email-client friendly.
 */
export const EndorsementOtpEmail = ({
  endorserName = "John Doe",
  otpCode = "123456",
  expiresInMinutes = 10,
  manageUrl = "https://craigdavison.net/endorsements/view/123",
}: EndorsementOtpEmailProps): React.JSX.Element => {
  const previewText = `Your endorsement verification code: ${otpCode}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>Verify it’s you</Heading>
            <Text style={styles.headerSubtitle}>Endorsement edit / delete request</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.paragraph}>Hi {endorserName},</Text>

            <Text style={styles.paragraph}>
              Someone requested a one-time verification code to manage your endorsement.
              Enter the code below on the website to continue.
            </Text>

            <Section style={styles.card}>
              <Text style={styles.cardLabel}>Your verification code</Text>
              <Text
                style={{
                  margin: "0",
                  fontSize: "28px",
                  fontWeight: "700",
                  letterSpacing: "0.25em",
                  textAlign: "center",
                  color: "#1a202c",
                }}
              >
                {otpCode}
              </Text>
              <Text style={{ ...styles.cardMeta, marginTop: "16px" }}>
                This code expires in <strong>{expiresInMinutes} minutes</strong>.
              </Text>
            </Section>

            <Text style={styles.footerText}>
              If you did not request this, you can ignore this email — no changes will be
              made without the code.
            </Text>

            <Hr style={styles.hr} />

            <Text style={styles.legalText}>
              Open your endorsement management page:
              <br />
              <Link href={manageUrl} style={styles.footerLink}>
                {manageUrl}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EndorsementOtpEmail

