
import { HeroSection } from "@/components/sections/hero-section"
import { StackMarquee } from "@/components/sections/stack-marquee"
import { AboutSection } from "@/components/sections/about-section"
import { ExperienceSection } from "@/components/sections/experience-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { Separator } from "@/components/ui/separator"
import { SiteBackground } from "@/components/layout/site-background"
import { getExperienceData, getProjectsData, getSkillsData } from "@/lib/cv-data"
import { Header } from "@/components/header"

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

        <HeroSection />
        <StackMarquee />

        <div className="py-2">
          <Separator />
        </div>

        <AboutSection skills={skills} />
        <ExperienceSection items={experience} />
        <ProjectsSection items={projects} />

      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-10 text-sm sm:px-6">
          <p>© {new Date().getFullYear()} Craig Davison</p>
          <p>
            Built with Tailwind v4 + shadcn/ui. Animations use Motion (kept subtle on
            purpose).
          </p>
        </div>
      </footer>
    </SiteBackground>
  )
}
