import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { TagList } from "@/components/shared/composites/tag-list"
import { RichText } from "@/components/content/rich-text"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ExperienceItem } from "@/lib/cv-types"
import { formatExperienceDateRange } from "@/lib/format-date"

const DEFAULT_HIGHLIGHT_COUNT = 3
const DEFAULT_HIGHLIGHT_TRUNCATION = 150

function truncateText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

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
        if (!highlights.length && block.text) push(block.text)
        continue
      }

      // Handle Payload structure where items is an array of {item: string} objects
      const items = block.items ?? []
      for (const itemObj of items) {
        if (highlights.length >= maxItems) break
        push(itemObj.item)
      }
    }

    return highlights
  }

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

/**
 * Extracts tag names from the experience item's tag objects.
 * Tags are now relationship objects with id, name, and slug properties.
 */
function getTagNames(tags: ExperienceItem["tags"]): string[] {
  return tags.map((tag) => tag.name)
}

export function ExperienceCard({
  item,
  isExpanded,
  onToggleDetails,
  className,
}: {
  item: ExperienceItem
  isExpanded: boolean
  onToggleDetails: () => void
  className?: string
}) {
  const highlights = React.useMemo(
    () => getExperienceHighlights(item.content),
    [item.content],
  )

  const dateRange = formatExperienceDateRange(
    item.fromDate,
    item.toDate,
    item.isCurrentRole,
  )

  const tagNames = getTagNames(item.tags)

  return (
    <Card
      className={cn(
        "bg-card/60 supports-[backdrop-filter]:bg-card/40 grid h-full transition will-change-transform hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="row-start-1 gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <p className="text-muted-foreground text-xs">{dateRange}</p>
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
        <TagList tags={tagNames} />
      </CardFooter>
    </Card>
  )
}

