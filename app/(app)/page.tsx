import { HeroSection } from "@/app/(app)/_sections/hero-section"
import { StackMarquee } from "@/app/(app)/_sections/stack-marquee"
import { AboutSection } from "@/app/(app)/_sections/about-section"
import { ExperienceSection } from "@/app/(app)/_sections/experience-section"
import { ProjectsSection } from "@/app/(app)/_sections/projects-section"
import { EndorsementsSection, type EndorsementSummary } from "@/app/(app)/_sections/endorsements-section"
import { ContactSection } from "@/app/(app)/_sections/contact-section"
import { SiteBackground } from "@/components/shared/layout/site-background"
import { getExperienceData, getProjectsData, getSkillsData } from "@/lib/cv-data"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getPayloadClient } from "@/lib/payload/get-payload-client"
import { getPageConfig } from "@/lib/payload/get-page-config"
import { getSiteSettings } from "@/lib/seo/get-site-settings"
import { getCtaUrl, type CtaRow } from "@/lib/url/get-cta-url"
import type { HeroData, ResolvedCta } from "@/app/(app)/_sections/hero-section"

export const revalidate = 60

const BUTTON_VARIANTS: ResolvedCta["variant"][] = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "link",
  "destructive",
]

function resolveCtas(ctas: CtaRow[]): ResolvedCta[] {
  if (!Array.isArray(ctas) || ctas.length === 0) return []
  return ctas.map((cta) => {
    const { url, openInNewTab } = getCtaUrl(cta)
    const rawVariant = cta.variant?.trim()
    const variant =
      rawVariant && BUTTON_VARIANTS.includes(rawVariant as ResolvedCta["variant"])
        ? (rawVariant as ResolvedCta["variant"])
        : "default"
    return {
      label: cta.label ?? "",
      variant,
      url,
      openInNewTab,
    }
  })
}

export default async function Home() {
  // Data is read server-side (filesystem + Payload) for a fast, SEO-friendly single-page CV.
  const [experience, projects, skills, pageConfig, siteSettings] = await Promise.all([
    getExperienceData(),
    getProjectsData(),
    getSkillsData(),
    getPageConfig("home"),
    getSiteSettings(),
  ])

  const payload = await getPayloadClient()

  const endorsementsResult = await payload.find({
    collection: "endorsements",
    depth: 0,
    limit: 6,
    sort: "-approvedAt",
    where: {
      status: { equals: "approved" },
      consentToPublish: { equals: true },
    },
  })

  const endorsements = endorsementsResult.docs as unknown as EndorsementSummary[]

  const heroData: HeroData = pageConfig?.hero
    ? {
        eyebrow: pageConfig.hero.eyebrow ?? null,
        heading: pageConfig.hero.heading ?? null,
        lead: pageConfig.hero.lead ?? null,
        media: pageConfig.hero.media ?? null,
      }
    : { eyebrow: null, heading: null, lead: null, media: null }

  const ctas: ResolvedCta[] = pageConfig?.hero?.ctas
    ? resolveCtas(pageConfig.hero.ctas)
    : []

  const aboutSection = pageConfig?.sections?.find(
    (section) => section.sectionKey === "about",
  )
  const experienceSection = pageConfig?.sections?.find(
    (section) => section.sectionKey === "experience",
  )
  const projectsSection = pageConfig?.sections?.find(
    (section) => section.sectionKey === "projects",
  )
  const endorsementsSection = pageConfig?.sections?.find(
    (section) => section.sectionKey === "endorsements",
  )
  const contactSection = pageConfig?.sections?.find(
    (section) => section.sectionKey === "contact",
  )

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className=" w-full">
        {/* Anchor target for the "Home" nav link */}
        <div id="home" />

        <HeroSection heroData={heroData} ctas={ctas} />
        <StackMarquee />

        <AboutSection skills={skills} data={aboutSection} />
        <ExperienceSection items={experience} data={experienceSection} />
        <ProjectsSection items={projects} data={projectsSection} />
        {siteSettings.enableEndorsements ? (
          <EndorsementsSection endorsements={endorsements} data={endorsementsSection} />
        ) : null}
        {siteSettings.enableContactForm ? (
          <ContactSection data={contactSection} />
        ) : null}

      </main>

      <Footer />
    </SiteBackground>
  )
}
