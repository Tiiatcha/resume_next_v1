/**
 * Attribution parsing utilities.
 *
 * Converts stock media site attribution parse patterns (e.g. from Pexels, Unsplash)
 * into extractors that parse pasted attribution text into structured fields.
 *
 * Pattern format: literal text with placeholders like {{artist_name}}.
 * Supported placeholders:
 * - {{artist}}, {{artist_name}} → artistName
 * - {{artist_url}} → artistUrl
 * - {{image_url}} → imageUrl
 * - {{site_name}}, {{platform_name}} → platformName
 * - {{platform_url}} → platformUrl
 */

/** Result shape matching Media.imageAttribution group fields. */
export type ParsedAttribution = {
  artistName?: string | null
  artistUrl?: string | null
  imageUrl?: string | null
  platformName?: string | null
  platformUrl?: string | null
}

/** Maps pattern placeholder names to our attribution field names. */
const PLACEHOLDER_TO_FIELD: Record<string, keyof ParsedAttribution> = {
  artist: "artistName",
  artist_name: "artistName",
  artist_url: "artistUrl",
  image_url: "imageUrl",
  site_name: "platformName",
  platform_name: "platformName",
  platform_url: "platformUrl",
}

/** Escapes regex special characters in a literal string. */
function escapeRegexLiteral(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Builds a RegExp from a pattern string with {{placeholder}} tokens.
 * Placeholders become named capture groups. Duplicate placeholder names get
 * numeric suffixes (e.g. artist_url_0, artist_url_1) since JS forbids duplicate
 * capture group names.
 *
 * Returns the regex and a map from capture group name -> output field name.
 */
function patternToRegex(pattern: string): {
  regex: RegExp
  groupToField: Map<string, keyof ParsedAttribution>
} | null {
  const trimmed = pattern.trim()
  const placeholderRe = /\{\{(\w+)\}\}/g
  const parts: string[] = []
  const groupToField = new Map<string, keyof ParsedAttribution>()
  const placeholderCount = new Map<string, number>()
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = placeholderRe.exec(trimmed)) !== null) {
    const before = trimmed.slice(lastIndex, match.index)
    if (before.length > 0) {
      parts.push(escapeRegexLiteral(before))
    }
    const placeholderName = match[1]
    const field = PLACEHOLDER_TO_FIELD[placeholderName]
    if (field) {
      const count = (placeholderCount.get(placeholderName) ?? 0)
      placeholderCount.set(placeholderName, count + 1)
      const uniqueGroupName = count === 0 ? placeholderName : `${placeholderName}_${count}`
      parts.push(`(?<${uniqueGroupName}>.+?)`)
      groupToField.set(uniqueGroupName, field)
    }
    lastIndex = placeholderRe.lastIndex
  }

  const after = trimmed.slice(lastIndex)
  if (after.length > 0) {
    parts.push(escapeRegexLiteral(after))
  }

  if (parts.length === 0) return null

  try {
    const regex = new RegExp(`^${parts.join("")}$`, "s")
    return { regex, groupToField }
  } catch (err) {
    console.warn(`${LOG_PREFIX} RegExp build error:`, err)
    return null
  }
}

const LOG_PREFIX = "[AttributionParser]"

/** Logs debug info when parsing fails. Helps diagnose pattern mismatch issues. */
function logParseFailure(
  reason: string,
  context: {
    pastedTextSample: string
    pattern: string
    regexSource?: string | null
    matchResult?: RegExpMatchArray | null
  },
): void {
  console.warn(
    `${LOG_PREFIX} Parse failed: ${reason}`,
    {
      pastedTextSample:
        context.pastedTextSample.length > 200
          ? `${context.pastedTextSample.slice(0, 200)}...`
          : context.pastedTextSample,
      pastedTextLength: context.pastedTextSample.length,
      pattern: context.pattern,
      regexSource: context.regexSource ?? "(regex build failed)",
      matchResult: context.matchResult,
    },
  )
}

/**
 * Parses pasted attribution text using a site's pattern template.
 *
 * @param pastedText - Raw attribution string copied from the stock media site
 * @param pattern - Pattern template with {{placeholder}} tokens
 * @param siteDefaults - Optional default platform name/url when not in pattern
 * @returns Parsed attribution object, or null if parse fails
 */
export function parseAttributionFromPattern(
  pastedText: string,
  pattern: string,
  siteDefaults?: { platformName?: string; platformUrl?: string },
): ParsedAttribution | null {
  const normalized = pastedText.trim()
  if (!normalized || !pattern.trim()) {
    logParseFailure("Empty input or pattern", {
      pastedTextSample: pastedText,
      pattern,
    })
    return null
  }

  const built = patternToRegex(pattern)
  if (!built) {
    logParseFailure("Failed to build regex from pattern", {
      pastedTextSample: normalized,
      pattern,
    })
    return null
  }

  const { regex, groupToField } = built
  const match = normalized.match(regex)
  if (!match?.groups) {
    logParseFailure("Pattern did not match pasted text", {
      pastedTextSample: normalized,
      pattern,
      regexSource: regex.source,
      matchResult: match,
    })
    return null
  }

  const result: ParsedAttribution = {
    artistName: null,
    artistUrl: null,
    imageUrl: null,
    platformName: siteDefaults?.platformName ?? null,
    platformUrl: siteDefaults?.platformUrl ?? null,
  }

  for (const [groupName, value] of Object.entries(match.groups)) {
    const field = groupToField.get(groupName)
    const trimmed = typeof value === "string" ? value.trim() : ""
    if (field && trimmed && result[field] == null) {
      ;(result as Record<string, string | null>)[field] = trimmed
    }
  }

  return result
}
