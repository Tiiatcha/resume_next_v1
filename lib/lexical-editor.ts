/**
 * Shared Lexical rich text editor used as the default for all richText fields.
 *
 * Used by:
 * - payload.config.ts as the global `editor` (applies to every richText field
 *   that does not override `editor`).
 *
 * Features include default Lexical features plus TextStateFeature (custom text
 * colors, gradient backgrounds, outline, highlight). The same state is used
 * for frontend rendering in payload-rich-text.tsx via lib/lexical-text-state.ts.
 */

import {
  defaultColors,
  lexicalEditor,
  TextStateFeature,
} from "@payloadcms/richtext-lexical"
import { customTextState } from "@/lib/lexical-text-state"

/**
 * Default Lexical editor with TextStateFeature (color, background, outline, highlight).
 * Use this as the global editor in payload.config or on any richText field.
 */
export const sharedLexicalEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    TextStateFeature({
      state: {
        color: { ...defaultColors.text },
        background: {
          ...defaultColors.background,
          ...customTextState.background,
        },
        outline: customTextState.outline,
        highlight: customTextState.highlight,
      },
    }),
  ],
})
