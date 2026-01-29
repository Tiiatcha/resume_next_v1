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
export function PayloadRichText({ data, className }: PayloadRichTextProps) {
  if (!data) return null

  return (
    <div className={className}>
      <RichTextConverter data={data} />
    </div>
  )
}

