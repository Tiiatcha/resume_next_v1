export type ContactDetails = {
  /**
   * Primary email address used across the site.
   *
   * Kept in one place so contact components stay consistent.
   */
  emailAddress: string

  /**
   * Phone number formatted for humans (spacing, leading 0, etc).
   */
  phoneNumberDisplay: string

  /**
   * Phone number in E.164 format (digits only, includes country code, no `+`).
   *
   * Used for `tel:` links and WhatsApp deep links.
   */
  phoneNumberE164: string

  /**
   * Human-readable location string shown in the UI.
   */
  location: string

  /**
   * Deep link to a map pin / search result for the location.
   */
  googleMapsHref: string
}

export const contactDetails: ContactDetails = {
  emailAddress: "craig@davisonmail.co.uk",
  phoneNumberDisplay: "07359 828685",
  // WhatsApp requires an international number with country code, no plus sign, no spaces.
  // UK number: 07359 828685 → +44 7359 828685 → 447359828685
  phoneNumberE164: "447359828685",
  location: "Earl Shilton, Leicestershire",
  googleMapsHref:
    "https://www.google.com/maps/place/Earl+Shilton,+Leicester/@52.5752417,-1.3349447,5029m/data=!3m2!1e3!4b1!4m6!3m5!1s0x48775b8c6c782fa3:0x9711847b6423008c!8m2!3d52.5763906!4d-1.3113676!16zL20vMDF6ajdf?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D",
}

/**
 * Convenience helpers to keep link formatting consistent (and searchable).
 */
export function getContactHrefs(details: ContactDetails = contactDetails) {
  return {
    emailHref: `mailto:${details.emailAddress}`,
    telephoneHref: `tel:${details.phoneNumberE164}`,
    whatsappHref: `https://wa.me/${details.phoneNumberE164}`,
    mapsHref: details.googleMapsHref,
  } as const
}

