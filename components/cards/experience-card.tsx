import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { TagList } from "@/components/primitives/tag-list"
import { RichText } from "@/components/content/rich-text"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExperienceItem } from "@/lib/cv-types"

const DEFAULT_HIGHLIGHT_COUNT = 3
const DEFAULT_HIGHLIGHT_TRUNCATION = 150

function truncateText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

/**
 * Extracts a small set of preview bullets from the structured RichText content.
 *
 * This keeps the timeline scannable while preserving the full write-up behind
 * a details toggle. The goal is not perfect summarization—just a reliable,
 * consistent preview.
 */
function getExperienceHighlights(
  content: ExperienceItem["content"],
  maxItems = DEFAULT_HIGHLIGHT_COUNT,
) {
  const highlights: string[] = []

  const push = (value: string) => {
    if (!value.trim()) return
    if (highlights.length >= maxItems) return
    highlights.push(truncateText(value, DEFAULT_HIGHLIGHT_TRUNCATION))
  }

  if (content.type === "paragraphs") {
    push(content.content[0] ?? "")
    return highlights
  }

  if (content.type === "mixed") {
    for (const block of content.sections) {
      if (highlights.length >= maxItems) break

      if (block.type === "paragraph") {
        // Prefer bullet-ish sections when available; only fall back to a paragraph
        // when we don't yet have any highlights.
        if (!highlights.length) push(block.text)
        continue
      }

      for (const item of block.items) {
        if (highlights.length >= maxItems) break
        push(item)
      }
    }

    return highlights
  }

  // content.type === "list"
  for (const item of content.items) {
    if (highlights.length >= maxItems) break

    if (item.text) {
      push(`${item.label}: ${item.text}`)
      continue
    }

    for (const child of item.items ?? []) {
      if (highlights.length >= maxItems) break
      push(`${child.label}: ${child.text}`)
    }
  }

  return highlights
}

export function ExperienceCard({
  item,
  isExpanded,
  onToggleDetails,
  className,
}: {
  item: ExperienceItem
  /**
   * When true, renders the full role write-up (RichText). When false, renders a
   * short preview so the timeline stays scannable.
   */
  isExpanded: boolean
  /**
   * Called when the user toggles "details" open/closed.
   */
  onToggleDetails: () => void
  className?: string
}) {
  const highlights = React.useMemo(
    () => getExperienceHighlights(item.content),
    [item.content],
  )

  return (
    <Card
      className={cn(
        // Note: scroll-based reveal is applied by the parent timeline via `Reveal`.
        // Layout note:
        // - Render the Card as a grid so it can participate in CSS Subgrid when the
        //   parent establishes explicit tracks (e.g. `CardContainer` with 4 rows).
        "bg-card/60 supports-[backdrop-filter]:bg-card/40 grid h-full transition will-change-transform hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="row-start-1 gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <p className="text-muted-foreground text-xs">
            {item.from} — {item.to}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">{item.company}</p>

        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-expanded={isExpanded}
            onClick={onToggleDetails}
            className="gap-1"
          >
            {isExpanded ? "Hide details" : "View details"}
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground size-3.5 transition-transform duration-200",
                isExpanded ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="row-start-2 row-span-2">
        {isExpanded ? (
          <div className="animate-in fade-in duration-200">
            <RichText value={item.content} />
          </div>
        ) : highlights.length ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <CardFooter className="row-start-4 items-end">
        <TagList tags={item.tags} />
      </CardFooter>
    </Card>
  )
}

