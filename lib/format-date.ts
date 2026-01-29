/**
 * Date formatting utilities for the CV/resume.
 *
 * Dates are stored as ISO strings in Payload CMS and need to be
 * formatted for display in a human-friendly format.
 */

/**
 * Formats an ISO date string to "MMMM YYYY" format.
 *
 * @param isoDateString - ISO date string from Payload (e.g., "2024-01-15T00:00:00.000Z")
 * @returns Formatted date string (e.g., "January 2024")
 *
 * @example
 * formatMonthYear("2024-01-15T00:00:00.000Z") // "January 2024"
 */
export function formatMonthYear(isoDateString: string): string {
  const date = new Date(isoDateString)
  
  if (Number.isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${isoDateString}`)
    return isoDateString
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

/**
 * Formats an experience date range for display.
 *
 * @param fromDate - ISO date string for the start date
 * @param toDate - ISO date string for the end date (optional if current role)
 * @param isCurrentRole - Whether this is the user's current role
 * @returns Formatted date range (e.g., "January 2024 — Present" or "January 2024 — August 2024")
 *
 * @example
 * formatExperienceDateRange("2024-01-15T00:00:00.000Z", null, true)
 * // "January 2024 — Present"
 *
 * formatExperienceDateRange("2017-01-01T00:00:00.000Z", "2023-08-31T00:00:00.000Z", false)
 * // "January 2017 — August 2023"
 */
export function formatExperienceDateRange(
  fromDate: string,
  toDate: string | null | undefined,
  isCurrentRole: boolean | null | undefined,
): string {
  const formattedFrom = formatMonthYear(fromDate)

  if (isCurrentRole) {
    return `${formattedFrom} — Present`
  }

  if (!toDate) {
    // If not marked as current but no end date, fall back to showing just the start date
    console.warn(`Experience has no end date and is not marked as current: ${fromDate}`)
    return formattedFrom
  }

  const formattedTo = formatMonthYear(toDate)
  return `${formattedFrom} — ${formattedTo}`
}
