import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Section from "@/components/shared/layout/section"
import { Container } from "@/components/shared/layout/container"
import type { Media } from "@/payload-types"

/** Hero content from page-configs (hero group). */
export type HeroData = {
  eyebrow?: string | null
  heading?: string | null
  lead?: string | null
  media?: (string | Media) | null
  
}

/** CTA resolved for display (url + openInNewTab from getCtaUrl). */
export type ResolvedCta = {
  label: string
  variant: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  url: string
  openInNewTab: boolean
}

type HeroSectionProps = {
  heroData?: HeroData | null
  ctas?: ResolvedCta[]
}


export function HeroSection({ heroData, ctas = [] }: HeroSectionProps) {
  const eyebrow = heroData?.eyebrow?.trim() 
  const heading = heroData?.heading?.trim() 
  const lead = heroData?.lead?.trim() 
  const heroMedia = heroData?.media && typeof heroData.media === "object" ? heroData.media : null

  return (
    <Section variant="tight" className="py-0 pt-below-nav min-h-[80vh]">
      <div aria-hidden="true" className="hero-geometric-layer" />
      <Container variant="left" className="gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-5">
            <p className="hero-eyebrow">
              {eyebrow}
            </p>

            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-primary via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                {heading}
              </h1>
              <p className="text-muted-foreground text-pretty text-lg leading-relaxed">
                {lead}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              
              
              {ctas.map((cta) => (
                  <Button key={cta.url + cta.label} asChild variant={cta.variant}>
                    <a
                      href={cta.url}
                      target={cta.openInNewTab ? "_blank" : undefined}
                      rel={cta.openInNewTab ? "noreferrer" : undefined}
                    >
                      {cta.label}
                    </a>
                  </Button>
                ))}
              
            </div>
          </div>

          <div className="grid gap-3">
            <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                  Impact
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Built solutions saving{" "}
                  <span className="font-semibold">£1m+</span> on an{" "}
                  <span className="font-semibold">£8m</span> contract and improved
                  operational efficiency by up to{" "}
                  <span className="font-semibold">30%</span>.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                    Focus
                  </p>
                  <p className="mt-2 text-sm font-medium">Modern web</p>
                  <p className="text-muted-foreground text-xs">Next.js • React</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                    Strength
                  </p>
                  <p className="mt-2 text-sm font-medium">Delivery</p>
                  <p className="text-muted-foreground text-xs">Agile • Coaching</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

