"use client"

import { useRowLabel } from "@payloadcms/ui"

/**
 * Generic row label component for Payload array fields.
 *
 * - Reads the current row's data via `useRowLabel`.
 * - Uses a chosen field (e.g. `sectionKey`, `label`, etc.) as the label when present.
 * - Falls back to a simple "<fallbackLabel> <rowNumber>" pattern when the field is empty.
 *
 * This component is intended to be reused across collections by configuring it
 * via `admin.components.RowLabel` and passing `clientProps`:
 *
 * {
 *   admin: {
 *     components: {
 *       RowLabel: {
 *         path: "./components/payload/array-row-label",
 *         clientProps: { field: "sectionKey", fallbackLabel: "Section" },
 *       },
 *     },
 *   },
 * }
 */
type ArrayRowLabelProps = {
  /**
   * Field name on the row data whose value should be used as the label.
   * Examples: "sectionKey", "label", "name".
   */
  field?: string
  /**
   * Fallback label prefix when the field is empty.
   * Example: \"Section\" → \"Section 1\", \"Section 2\", ...
   */
  fallbackLabel?: string
}

export default function ArrayRowLabel({
  field = "label",
  fallbackLabel = "Row",
}: ArrayRowLabelProps) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()

  const rawValue =
    field && typeof data?.[field] === "string"
      ? (data[field] as string).trim()
      : ""

  if (rawValue) {
    return <>{rawValue}</>
  }

  const number = typeof rowNumber === "number" ? rowNumber : 1
  return <>{`${fallbackLabel} ${number}`}</>
}

