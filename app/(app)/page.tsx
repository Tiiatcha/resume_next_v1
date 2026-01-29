
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

export default async function Home() {
  // Data is read server-side (filesystem) for a fast, SEO-friendly single-page CV.
  // Styling remains Tailwind v4 tokens; Motion only handles subtle reveal animations.
  const [experience, projects, skills] = await Promise.all([
    getExperienceData(),
    getProjectsData(),
    getSkillsData(),
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

  return (
    <SiteBackground className="font-sans">
      <Header />

      <main className=" w-full">
        {/* Anchor target for the "Home" nav link */}
        <div id="home" />

        <HeroSection />
        <StackMarquee />

        <AboutSection skills={skills} />
        <ExperienceSection items={experience} />
        <ProjectsSection items={projects} />
        <EndorsementsSection endorsements={endorsements} />
        <ContactSection />

      </main>

      <Footer />
    </SiteBackground>
  )
}
