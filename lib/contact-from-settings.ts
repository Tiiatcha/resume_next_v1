import type { NormalisedSiteSettings } from "@/lib/seo/get-site-settings"

/**
 * Contact display and link values derived from Site Settings (Contact tab).
 * Used by the contact section and footer so both stay in sync with the CMS.
 */
export type ContactFromSettings = {
  emailHref: string
  telephoneHref: string
  whatsappHref: string
  emailDisplay: string
  phoneDisplay: string
  locationDisplay: string
  mapsHref: string
}

/**
 * Build mailto/tel/WhatsApp/maps hrefs and display strings from site settings.
 * Returns safe fallbacks (e.g. "—", "#") when settings or fields are missing.
 */
export function getContactFromSettings(
  settings: NormalisedSiteSettings | null,
): ContactFromSettings {
  const email = settings?.contactEmail?.trim() || ""
  const phone = settings?.contactPhone?.replace(/\D/g, "") || ""
  const whatsapp = settings?.contactWhatsApp?.replace(/\D/g, "") || phone

  return {
    emailHref: email ? `mailto:${email}` : "#",
    telephoneHref: phone ? `tel:${phone}` : "#",
    whatsappHref: whatsapp ? `https://wa.me/${whatsapp}` : "#",
    emailDisplay: email || "—",
    phoneDisplay: settings?.contactPhone?.trim() || "—",
    locationDisplay: settings?.contactLocation?.trim() || "—",
    mapsHref: settings?.contactLocation
      ? `https://www.google.com/maps/search/?query=${encodeURIComponent(settings.contactLocation)}`
      : "#",
  }
}
