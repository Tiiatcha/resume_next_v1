import type { Metadata } from "next"
import { cookies } from "next/headers"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import config from "@/payload.config"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { Reveal } from "@/components/shared/motion/reveal"
import Section from "@/components/shared/layout/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerTitle,
  ContainerLead,
} from "@/components/shared/layout/container"

import type { Endorsement } from "@/payload-types"
import type { EndorsementSummary } from "@/app/(app)/endorsements/_components/endorsement-types"
import { PublicEndorsementPreview } from "@/app/(app)/endorsements/view/[id]/_components/public-endorsement-preview"
import { EndorsementAccessPanel } from "@/app/(app)/endorsements/view/[id]/_components/endorsement-access-panel"
import { EndorsementEditor, type EndorsementEditorData } from "@/app/(app)/endorsements/view/[id]/_components/endorsement-editor"
import { ENDORSEMENT_ACCESS_COOKIE_NAME, verifyEndorsementAccessToken } from "@/lib/endorsements/access-session"

/**
 * Page for viewing a specific endorsement.
 * 
 * This page allows endorsers to view their submission and provides a way for them
 * to request updates or changes. The page displays the current status and all
 * details of their endorsement.
 * 
 * Future enhancements:
 * - (Implemented) OTP-based access control for non-registered endorsers
 * - (Implemented) Allow endorsers to edit/delete their submissions after verification
 *
 * Security note:
 * - Until OTP verification, we intentionally show only what is publicly visible in the
 *   endorsements section (i.e. approved endorsements and display-preference-safe fields).
 */

interface EndorsementViewPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: EndorsementViewPageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `View Endorsement — Craig Davison`,
    description: "View and manage your endorsement submission.",
    robots: "noindex, nofollow", // Prevent indexing of individual endorsement view pages
  }
}

function mapEndorsementToPublicSummary(doc: Endorsement): EndorsementSummary {
  return {
    id: doc.id,
    endorsementText: doc.endorsementText,
    endorserName: doc.endorserName,
    relationshipType: doc.relationshipType,
    roleOrTitle: doc.roleOrTitle ?? null,
    companyOrProject: doc.companyOrProject ?? null,
    linkedinUrl: doc.linkedinUrl ?? null,
    displayPreferences: doc.displayPreferences ?? null,
  }
}

function mapEndorsementToEditorData(doc: Endorsement): EndorsementEditorData {
  return {
    id: doc.id,
    status: doc.status,
    endorserName: doc.endorserName,
    endorserEmail: doc.endorserEmail ?? null,
    relationshipType: doc.relationshipType,
    roleOrTitle: doc.roleOrTitle ?? null,
    companyOrProject: doc.companyOrProject ?? null,
    linkedinUrl: doc.linkedinUrl ?? null,
    endorsementText: doc.endorsementText,
    displayPreferences: doc.displayPreferences ?? null,
  }
}

export default async function EndorsementViewPage({ params }: EndorsementViewPageProps) {
  const { id } = await params
  const payload = await getPayloadHMR({ config })

  const cookieStore = await cookies()
  const rawCookieValue = cookieStore.get(ENDORSEMENT_ACCESS_COOKIE_NAME)?.value

  const decodedCookieValue =
    rawCookieValue && rawCookieValue.length > 0
      ? (() => {
          try {
            return decodeURIComponent(rawCookieValue)
          } catch {
            return rawCookieValue
          }
        })()
      : null

  const session = decodedCookieValue ? verifyEndorsementAccessToken(decodedCookieValue) : null

  const hasVerifiedAccess = Boolean(session && session.endorsementId === id)

  let editorEndorsement: EndorsementEditorData | null = null
  if (hasVerifiedAccess) {
    try {
      const doc = (await payload.findByID({
        collection: "endorsements",
        id,
        overrideAccess: true,
      })) as Endorsement
      editorEndorsement = mapEndorsementToEditorData(doc)
    } catch {
      // If the endorsement no longer exists, fall back to the unverified UI.
      editorEndorsement = null
    }
  }

  // Public preview: only fetch using normal access rules (approved endorsements only).
  let publicSummary: EndorsementSummary | null = null
  try {
    const doc = (await payload.findByID({
      collection: "endorsements",
      id,
    })) as Endorsement
    publicSummary = mapEndorsementToPublicSummary(doc)
  } catch {
    publicSummary = null
  }

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className="w-full">
        <Section id="view-endorsement" surface="alt" glow={{ side: "right", tone: "cool" }}>
          <Container variant="left" className="py-12 sm:py-16">
            <ContainerIntro variant="left" className="gap-3">
              <ContainerEyebrow>Your Endorsement</ContainerEyebrow>
              <ContainerTitle>
                {editorEndorsement
                  ? `Thank you, ${editorEndorsement.endorserName}`
                  : "Review or manage your endorsement"}
              </ContainerTitle>
              <ContainerLead variant="left">
                {editorEndorsement
                  ? "You’re verified. You can review, edit, or delete your endorsement below."
                  : "To protect your endorsement from unwanted changes, we’ll ask you to verify your email before showing private details or enabling edits."}
              </ContainerLead>
            </ContainerIntro>

            <ContainerContent variant="left" className="mt-8 w-full gap-8">
              <Reveal className="w-full">
                {editorEndorsement ? (
                  <EndorsementEditor endorsement={editorEndorsement} />
                ) : (
                  <div className="grid w-full gap-6 lg:grid-cols-2">
                    <PublicEndorsementPreview endorsement={publicSummary} />
                    <EndorsementAccessPanel endorsementId={id} />
                  </div>
                )}
              </Reveal>
            </ContainerContent>
          </Container>
        </Section>
      </main>

      <Footer />
    </SiteBackground>
  )
}
