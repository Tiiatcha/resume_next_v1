"use client"

import type { DefaultNodeTypes, SerializedTextNode } from "@payloadcms/richtext-lexical"
import { defaultColors } from "@payloadcms/richtext-lexical"
import {
  type JSXConvertersFunction,
  RichText as RichTextConverter,
  defaultJSXConverters,
} from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { customTextState } from "@/lib/lexical-text-state"
import type React from "react"

/**
 * Lexical stores TextStateFeature state on serialized text nodes under this key.
 * @see https://lexical.dev/docs/concepts/serialization#node-state
 */
const NODE_STATE_KEY = "$" as const

/**
 * Full text state config used for JSX conversion.
 * Must match the state passed to TextStateFeature in PageConfigs (defaultColors + customTextState).
 */
const fullTextState = {
  color: { ...defaultColors.text },
  background: {
    ...defaultColors.background,
    ...customTextState.background,
  },
  outline: customTextState.outline,
  highlight: customTextState.highlight,
} as const

type StateValues = Record<
  string,
  { css: Record<string, string>; label: string }
>
type StateConfig = Record<string, StateValues>

/**
 * Converts hyphenated CSS property names to camelCase for React inline styles.
 */
function hyphenToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  )
}

/**
 * Merges CSS from all TextStateFeature state keys present on the serialized node
 * into a single React.CSSProperties object. Returns null if no state is set.
 * Lexical stores this state under NODE_STATE_KEY ("$") on the serialized node.
 */
function getMergedStylesFromNodeState(
  node: SerializedTextNode & Record<string, unknown>,
  stateConfig: StateConfig,
): React.CSSProperties | null {
  const state = node[NODE_STATE_KEY] as Record<string, string> | undefined
  if (!state || typeof state !== "object") return null

  const merged: Record<string, string> = {}
  for (const stateKey of Object.keys(stateConfig)) {
    const stateValue = state[stateKey]
    if (typeof stateValue !== "string") continue
    const values = stateConfig[stateKey]
    const entry = values?.[stateValue]?.css
    if (entry && typeof entry === "object") {
      Object.assign(merged, entry)
    }
  }
  if (Object.keys(merged).length === 0) return null

  const reactStyle: Record<string, string> = {}
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === "string") {
      reactStyle[hyphenToCamel(key)] = value
    }
  }
  return reactStyle as React.CSSProperties
}

/**
 * Custom text converter that applies TextStateFeature styles (color, background,
 * outline, highlight) when converting Lexical text nodes to JSX.
 * Uses the default text converter for format (bold, italic, etc.) then wraps
 * with a span with merged inline styles when the node has text state.
 * Cast to match JSXConverter<SerializedTextNode> for assignment to converters.text.
 */
function textConverterWithState(
  args: { node: SerializedTextNode & Record<string, unknown> } & Record<
    string,
    unknown
  >,
): React.ReactNode {
  const defaultConverter = defaultJSXConverters.text
  const defaultContent =
    typeof defaultConverter === "function"
      ? (
          defaultConverter as (
            a: typeof args,
          ) => React.ReactNode
        )(args)
      : args.node.text
  const style = getMergedStylesFromNodeState(args.node, fullTextState)
  if (style == null) return defaultContent
  return <span style={style}>{defaultContent}</span>
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  text: textConverterWithState as (typeof defaultJSXConverters)["text"],
})

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
      <RichTextConverter converters={jsxConverters} data={data} />
    </div>
  )
}
