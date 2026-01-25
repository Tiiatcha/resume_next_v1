
import { HeroSection } from "@/components/sections/hero-section"
import { StackMarquee } from "@/components/sections/stack-marquee"
import { AboutSection } from "@/components/sections/about-section"
import { ExperienceSection } from "@/components/sections/experience-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { ContactSection } from "@/components/sections/contact-section"
import { Separator } from "@/components/ui/separator"
import { SiteBackground } from "@/components/layout/site-background"
import { getExperienceData, getProjectsData, getSkillsData } from "@/lib/cv-data"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function Home() {
  // Data is read server-side (filesystem) for a fast, SEO-friendly single-page CV.
  // Styling remains Tailwind v4 tokens; Motion only handles subtle reveal animations.
  const [experience, projects, skills] = await Promise.all([
    getExperienceData(),
    getProjectsData(),
    getSkillsData(),
  ])

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
        <ContactSection />

      </main>

      <Footer />
    </SiteBackground>
  )
}
