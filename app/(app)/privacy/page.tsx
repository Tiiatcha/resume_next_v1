import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Container } from "@/components/shared/layout/container"
import { PayloadRichText } from "@/components/content/payload-rich-text"
import { getSiteSettings } from "@/lib/seo/get-site-settings"

export const metadata: Metadata = {
  title: "Privacy Policy — Craig Davison",
  description: "Privacy policy for craigdavison.com.",
}

export const revalidate = 60

/**
 * Example: consuming privacyPolicyContent from Site Settings.
 *
 * Site Settings → Legal tab holds the source-of-truth rich text for this page.
 * Add a link to /privacy in your footer or nav when ready.
 */
export default async function PrivacyPage() {
  const settings = await getSiteSettings()

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full px-4 py-12">
        <Container variant="left" className="gap-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>

          {settings.privacyPolicyContent ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <PayloadRichText data={settings.privacyPolicyContent} />
            </div>
          ) : (
            <p className="text-muted-foreground">
              Privacy policy content can be edited in Payload: Site settings →
              Legal → Privacy policy content.
            </p>
          )}
        </Container>
      </main>

      <Footer />
    </SiteBackground>
  )
}
