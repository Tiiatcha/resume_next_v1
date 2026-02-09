"use client"

import * as React from "react"
import type { NormalisedSiteSettings } from "@/lib/seo/get-site-settings"

/**
 * Context for site-wide settings (SEO, contact, CV, features, legal).
 * Provided by the (app) layout so Header, Footer, and pages can consume
 * without prop drilling. When null (e.g. outside provider), consumers
 * should treat as "show all" / use fallbacks.
 */
const SiteSettingsContext = React.createContext<NormalisedSiteSettings | null>(
  null,
)

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: NormalisedSiteSettings | null
  children: React.ReactNode
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings(): NormalisedSiteSettings | null {
  return React.useContext(SiteSettingsContext)
}
