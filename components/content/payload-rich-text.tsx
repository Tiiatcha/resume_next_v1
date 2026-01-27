import * as React from "react"
import { RichText as RichTextConverter } from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

type PayloadRichTextProps = {
  /**
   * The Lexical editor state stored by Payload.
   * This is typically the value of a `richText` field.
   */
  data: SerializedEditorState | null | undefined
  className?: string
}

/**
 * Render Payload Lexical rich text as React elements.
 *
 * This keeps "how we render rich text" in one place so blog pages stay simple.
 * If you later add custom blocks (images, callouts, code snippets), this is where
 * you’ll extend the converter.
 */
export function PayloadRichText({ data, className }: PayloadRichTextProps) {
  if (!data) return null

  return (
    <div className={className}>
      <RichTextConverter data={data} />
    </div>
  )
}

