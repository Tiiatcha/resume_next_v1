import * as React from "react"

import type { RichTextContent } from "@/lib/cv-types"

function Paragraphs({ content }: { content: string[] }) {
  return (
    <div className="space-y-4">
      {content.map((text, idx) => (
        <p key={idx} className="text-muted-foreground text-pretty leading-relaxed">
          {text}
        </p>
      ))}
    </div>
  )
}

function Mixed({
  sections,
}: {
  sections: Array<
    | { type: "paragraph"; text?: string | null }
    | { type: "section"; heading?: string | null; items?: Array<{ item: string; id?: string | null }> | null }
  >
}) {
  return (
    <div className="space-y-4">
      {sections.map((block, idx) => {
        if (block.type === "paragraph") {
          // Skip empty paragraphs
          if (!block.text?.trim()) return null

          return (
            <p
              key={idx}
              className="text-muted-foreground text-pretty leading-relaxed"
            >
              {block.text}
            </p>
          )
        }

        // Skip sections with no items
        if (!block.items || block.items.length === 0) return null

        return (
          <div key={idx} className="space-y-2">
            {block.heading && (
              <p className="text-sm font-medium">{block.heading}</p>
            )}
            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {block.items.map((itemObj) => (
                <li key={itemObj.id ?? itemObj.item}>{itemObj.item}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function List({
  items,
}: {
  items: Array<{
    label: string
    text?: string
    items?: Array<{ label: string; text: string }>
  }>
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <p className="text-sm font-medium">{item.label}</p>
          {item.text ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.text}
            </p>
          ) : null}
          {item.items?.length ? (
            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {item.items.map((child) => (
                <li key={child.label}>
                  <span className="text-foreground/90 font-medium">
                    {child.label}:
                  </span>{" "}
                  {child.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function RichText({ value }: { value: RichTextContent }) {
  if (value.type === "paragraphs") return <Paragraphs content={value.content} />
  if (value.type === "mixed") return <Mixed sections={value.sections} />
  return <List items={value.items} />
}

