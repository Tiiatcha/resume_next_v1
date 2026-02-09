"use client"

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
import { Container } from "@/components/shared/layout/container"
import { SectionGlowOrb } from "@/components/shared/layout/section-glow-orb"
import { getContactFromSettings } from "@/lib/contact-from-settings"
import { useSiteSettings } from "@/lib/site-settings-context"

type FooterNavLink = {
  label: string
  href: `/#${string}`
}

type FooterSiteLink = {
  label: string
  href: `/${string}`
}

const ALL_FOOTER_NAV_LINKS: FooterNavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
]

const ALL_FOOTER_SITE_LINKS: FooterSiteLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Changelog", href: "/changelog" },
]

/**
 * Site footer for the single-page CV.
 *
 * Contact and CV data come from Site Settings (Contact / CV tabs).
 * Feature flags from Site Settings control which nav/site links and CV button are shown.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const siteSettings = useSiteSettings()
  const contact = getContactFromSettings(siteSettings)

  const footerNavLinks = siteSettings
    ? ALL_FOOTER_NAV_LINKS.filter((link) => {
        if (link.label === "Contact") return siteSettings.enableContactForm
        return true
      })
    : ALL_FOOTER_NAV_LINKS

  const footerSiteLinks = siteSettings
    ? ALL_FOOTER_SITE_LINKS.filter((link) => {
        if (link.label === "Blog") return siteSettings.enableBlog
        if (link.label === "Roadmap") return siteSettings.enableRoadmap
        if (link.label === "Changelog") return siteSettings.enableChangelog
        return true
      })
    : ALL_FOOTER_SITE_LINKS

  const showCvDownload = siteSettings?.enableCvDownload !== false
  const cvUrl = siteSettings?.cvCurrent?.url ?? null
  const cvLabel = siteSettings?.cvCurrent?.displayName?.trim() || "Download CV"

  return (
    <footer className="relative isolate overflow-hidden border-t px-4">
      {/* Decorative glow, consistent with section glows (no x-overflow). */}
      <SectionGlowOrb
        side="right"
        tone="cool"
        className="-bottom-64 opacity-80"
      />

      <Container
        variant="left"
        className="relative z-10 gap-10 py-14"
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
                <a href={contact.emailHref}>
                  <Mail className="size-4" aria-hidden="true" />
                  Email me
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href={contact.whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </Button>

              {showCvDownload && cvUrl ? (
                <Button asChild variant="outline">
                  <a href={cvUrl} download>
                    {cvLabel}
                  </a>
                </Button>
              ) : null}
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
                  href={contact.emailHref}
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {contact.emailDisplay}
                </a>
              </li>
              <li>
                <a
                  href={contact.telephoneHref}
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={contact.mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  {contact.locationDisplay}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight">Built with</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="pop">
                <Layers aria-hidden="true" />
                Next.js
              </Badge>
              <Badge variant="pop">
                <Atom aria-hidden="true" />
                React
              </Badge>
              <Badge variant="pop">
                <Wind aria-hidden="true" />
                Tailwind v4
              </Badge>
              <Badge variant="pop">
                <LayoutGrid aria-hidden="true" />
                shadcn/ui
              </Badge>
              <Badge variant="pop">
                <Activity aria-hidden="true" />
                Motion
              </Badge>
              <Badge asChild variant="pop">
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
              <Badge asChild variant="pop">
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

