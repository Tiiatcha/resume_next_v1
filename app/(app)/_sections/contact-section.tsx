"use client"

import Section from "@/components/shared/layout/section"
import {
  Container,
  ContainerContent,
  ContainerEyebrow,
  ContainerIntro,
  ContainerLead,
  ContainerTitle,
} from "@/components/shared/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/shared/motion/reveal"
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { contactDetails, getContactHrefs } from "@/lib/contact-details"

export function ContactSection() {
  const { emailHref, telephoneHref, whatsappHref, mapsHref } =
    getContactHrefs(contactDetails)

  return (
    <Section
      id="contact"
      surface="alt"
      glow={{ side: "left", tone: "warm" }}
      reveal={false}
      // Give the final section a little more breathing room.
      className="py-20 sm:py-24 overflow-hidden"
    >
      {/* 
        Decorative map layer:
        - Reveals on scroll (so it "arrives" as you reach this section).
        - Non-interactive (`pointer-events-none`) so it behaves like a background.
        - Strongly toned + masked so it reads as a subtle pattern (not a bright embed).
        - Uses theme tokens (`--border`, `--primary`) so it naturally fits light/dark.
      */}
      <Reveal className="pointer-events-none absolute inset-0 z-0 overflow-hidden" y={0}>
        <div aria-hidden="true" className="absolute inset-0">
          {/* Map image (tinted + softened). */}
          <div className="absolute inset-0 opacity-45 dark:opacity-25 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]">
            <iframe
              aria-hidden="true"
              tabIndex={-1}
              className="h-full w-full origin-center scale-[1.15] grayscale contrast-125 saturate-0 brightness-[0.95] dark:brightness-[0.8] blur-[1px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map background centered on Earl Shilton"
              src="https://www.google.com/maps?q=Earl%20Shilton&z=13&output=embed"
            />
          </div>

          {/* Site-colored tint + subtle grid to harmonize with existing background. */}
          {/*
            Flat tint layer (no gradients):
            - Light mode: a subtle `--primary` wash.
            - Dark mode: use `--chart-4` (the site's existing accent glow family)
              to avoid a bright "hot spot" in the center.
          */}
          <div className="absolute inset-0 bg-[color-mix(in_oklch,var(--primary)_10%,transparent)] opacity-90 mix-blend-multiply dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-[color-mix(in_oklch,var(--chart-4)_10%,transparent)] opacity-70 [mix-blend-mode:soft-light]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_42%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_42%,transparent)_1px,transparent_1px)] bg-[size:88px_88px] opacity-15" />
          {/* Readability veil (keeps the map subtle behind text/cards). */}
          <div className="absolute inset-0 bg-background/35 dark:bg-background/55" />
        </div>
      </Reveal>

      <Container variant="left" className="relative z-10">
        <ContainerIntro variant="left">
          <ContainerEyebrow>Contact</ContainerEyebrow>
          <ContainerTitle>Let’s talk</ContainerTitle>
          <ContainerLead>
            If you’d like to discuss a role, a project, or a collaboration, you can
            reach me here.
          </ContainerLead>
        </ContainerIntro>

        <ContainerContent variant="left">
          <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal className="h-full" delaySeconds={0.0}>
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="text-muted-foreground size-4" aria-hidden="true" />
                      <CardTitle className="text-base">Email</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground text-pretty">
                    Best for introductions and role/project details.
                  </p>
                  <a
                    className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
                    href={emailHref}
                  >
                    {contactDetails.emailAddress}
                  </a>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal className="h-full" delaySeconds={0.05}>
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="text-muted-foreground size-4" aria-hidden="true" />
                      <CardTitle className="text-base">Phone</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground text-pretty">
                    Ideal for quick calls and time-sensitive questions.
                  </p>
                  <a
                    className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
                    href={telephoneHref}
                  >
                    {contactDetails.phoneNumberDisplay}
                  </a>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal className="h-full" delaySeconds={0.1}>
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle
                        className="text-muted-foreground size-4"
                        aria-hidden="true"
                      />
                      <CardTitle className="text-base">WhatsApp</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground text-pretty">
                    Great for a fast message or scheduling.
                  </p>
                  <a
                    className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Message me <ArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal className="h-full" delaySeconds={0.15}>
              <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground size-4" aria-hidden="true" />
                      <CardTitle className="text-base">Location</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground text-pretty">
                    Based in {contactDetails.location}.
                  </p>
                  <a
                    className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Google Maps{" "}
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </ContainerContent>
      </Container>
    </Section>
  )
}

