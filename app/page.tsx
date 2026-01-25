
import { HeroSection } from "@/components/sections/hero-section"
import { StackMarquee } from "@/components/sections/stack-marquee"
import { AboutSection } from "@/components/sections/about-section"
import { ExperienceSection } from "@/components/sections/experience-section"
import { ProjectsSection } from "@/components/sections/projects-section"
import { Separator } from "@/components/ui/separator"
import { SiteBackground } from "@/components/layout/site-background"
import { SectionGlowOrb } from "@/components/layout/section-glow-orb"
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

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-10">
          {/* Top-of-page "header/hero" area already has global background glow; no per-section orb. */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <HeroSection />
            <StackMarquee />
          </div>

          <div className="py-2">
            <Separator />
          </div>

          <div className="relative isolate animate-in fade-in slide-in-from-bottom-2 duration-700">
            <SectionGlowOrb side="left" tone="warm" />
            <div className="relative z-10">
              <AboutSection skills={skills} />
            </div>
          </div>

          <div className="relative isolate animate-in fade-in slide-in-from-bottom-2 duration-700">
            <SectionGlowOrb side="right" tone="cool" />
            <div className="relative z-10">
              <ExperienceSection items={experience} />
            </div>
          </div>

          <div className="relative isolate animate-in fade-in slide-in-from-bottom-2 duration-700">
            <SectionGlowOrb side="left" tone="warm" />
            <div className="relative z-10">
              <ProjectsSection items={projects} />
            </div>
          </div>
        </div>
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
