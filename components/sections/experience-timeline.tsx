"use client"

import * as React from "react"

import type { ExperienceItem } from "@/lib/cv-types"
import { cn } from "@/lib/utils"
import { ExperienceCard } from "@/components/cards/experience-card"
import { Reveal } from "@/components/motion/reveal"

function getExperienceKey(item: ExperienceItem) {
  return `${item.company}-${item.from}-${item.title}`
}

/**
 * Interactive experience timeline.
 *
 * - Mobile: a simple single-column timeline (easy to read, minimal layout shift).
 * - Desktop (`md+`): alternates cards on either side of a centered timeline line.
 * - Content: cards are collapsed by default and expand inline (single-open behavior).
 */
export function ExperienceTimeline({ items }: { items: ExperienceItem[] }) {
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null)

  return (
    <ol
      className={cn(
        // Mobile timeline: left border line and cards on the right.
        "mt-8 space-y-6 border-l pl-6",
        // Desktop timeline: centered line + alternating cards.
        "md:relative md:grid md:gap-y-10 md:space-y-0 md:border-l-0 md:pl-0",
        "md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:w-px md:before:-translate-x-1/2 md:before:bg-border md:before:content-['']",
      )}
    >
      {items.map((item, idx) => {
        const key = getExperienceKey(item)
        const isExpanded = expandedKey === key
        const shouldRenderOnLeftSide = idx % 2 === 0

        return (
          <li key={key} className="relative md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-6">
            <span
              aria-hidden="true"
              className={cn(
                // Mobile: dot anchored to the left border line.
                "bg-background ring-border absolute -left-[33px] top-6 grid size-4 place-items-center rounded-full ring-4",
                // Desktop: dot sits on the centered line.
                "md:static md:col-start-2 md:mt-6 md:justify-self-center",
              )}
            >
              <span className="bg-primary size-1.5 rounded-full" />
            </span>

            <Reveal
              className={cn(
                // Keep cards slightly closer to the center line for a tighter look.
                "md:max-w-xl",
                shouldRenderOnLeftSide
                  ? "md:col-start-1 md:justify-self-end"
                  : "md:col-start-3 md:justify-self-start",
              )}
            >
              <ExperienceCard
                item={item}
                isExpanded={isExpanded}
                onToggleDetails={() =>
                  setExpandedKey((currentKey) => (currentKey === key ? null : key))
                }
              />
            </Reveal>
          </li>
        )
      })}
    </ol>
  )
}

