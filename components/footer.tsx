import {
  Activity,
  Atom,
  ArrowUp,
  ArrowUpRight,
  Github,
  LayoutGrid,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Triangle,
  Wind,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/sections/components/container"
import { SectionGlowOrb } from "@/components/layout/section-glow-orb"
import { contactDetails, getContactHrefs } from "@/lib/contact-details"

type FooterNavLink = {
  label: string
  /**
   * Use an absolute in-app hash link (`/#section-id`) so navigation works even
   * from non-home pages (e.g. `/roadmap`).
   */
  href: `/#${string}`
}

const footerNavLinks: FooterNavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
]

type FooterSiteLink = {
  label: string
  href: `/${string}`
}

const footerSiteLinks: FooterSiteLink[] = [{ label: "Roadmap", href: "/roadmap" }]

/**
 * Site footer for the single-page CV.
 *
 * Design goals:
 * - Slightly richer than a "copyright bar" (CTA, quick links, contact shortcuts)
 * - Still lightweight: no client-side state, no JS-only interactions
 * - Accessible: clear labels, sensible focus styles, and no decorative noise for AT
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { emailHref, telephoneHref, whatsappHref, mapsHref } =
    getContactHrefs(contactDetails)

  return (
    <footer className="relative isolate overflow-hidden border-t">
      {/* Decorative glow, consistent with section glows (no x-overflow). */}
      <SectionGlowOrb
        side="right"
        tone="cool"
        className="-bottom-64 opacity-80"
      />

      <Container
        variant="left"
        className="relative z-10 gap-10 py-14 sm:px-6"
      >
        {/* CTA card */}
        <div className="w-full rounded-2xl border bg-card/60 p-6 supports-[backdrop-filter]:bg-card/40 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                Get in touch
              </p>
              <h2 className="text-pretty text-2xl font-semibold tracking-tight">
                Want to discuss a role or a project?
              </h2>
              <p className="text-muted-foreground text-pretty text-sm leading-relaxed">
                Email is best for details. For something quick, call or message me on
                WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <a href={emailHref}>
                  <Mail className="size-4" aria-hidden="true" />
                  Email me
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </Button>

              <Button asChild variant="outline">
                <a
                  href="/assets/documents/Craig%20Davison%20CV%20Oct%202024.pdf"
                  download="Craig-Davison-CV.pdf"
                >
                  Download CV
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid w-full gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Navigate</p>
            <ul className="text-muted-foreground grid gap-2 text-sm">
              {footerNavLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li aria-hidden="true" className="my-1 border-t" />
              {footerSiteLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Contact</p>
            <ul className="text-muted-foreground grid gap-2 text-sm">
              <li>
                <a
                  href={emailHref}
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {contactDetails.emailAddress}
                </a>
              </li>
              <li>
                <a
                  href={telephoneHref}
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {contactDetails.phoneNumberDisplay}
                </a>
              </li>
              <li>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  {contactDetails.location}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Built with</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Layers aria-hidden="true" />
                Next.js
              </Badge>
              <Badge variant="secondary">
                <Atom aria-hidden="true" />
                React
              </Badge>
              <Badge variant="secondary">
                <Wind aria-hidden="true" />
                Tailwind v4
              </Badge>
              <Badge variant="secondary">
                <LayoutGrid aria-hidden="true" />
                shadcn/ui
              </Badge>
              <Badge variant="secondary">
                <Activity aria-hidden="true" />
                Motion
              </Badge>
              <Badge asChild variant="secondary">
                <a
                  href="https://github.com/Tiiatcha/resume_next_v1"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Source code on GitHub (opens in a new tab)"
                >
                  <Github className="size-3" aria-hidden="true" />
                  Source code on GitHub
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              </Badge>
              <Badge asChild variant="secondary">
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Deployed on Vercel (opens in a new tab)"
                >
                  <Triangle className="size-3" aria-hidden="true" />
                  Deployed on Vercel
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Designed to be fast, readable, and easy to maintain.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            © {year} Craig Davison. All rights reserved.
          </p>

          <Button asChild variant="ghost" size="sm">
            <a href="#" aria-label="Back to top">
              <ArrowUp className="size-4" aria-hidden="true" />
              Back to top
            </a>
          </Button>
        </div>
      </Container>
    </footer>
  )
}

