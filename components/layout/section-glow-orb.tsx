import * as React from "react"

import { cn } from "@/lib/utils"

type GlowSide = "left" | "right"
type GlowTone = "cool" | "warm"

/**
 * Bottom-anchored background "orb" used to add subtle color and depth per section.
 *
 * Design goals:
 * - **Decorative only**: marked `aria-hidden` and `pointer-events-none`.
 * - **Theme-aware**: uses existing OKLCH tokens (e.g. `--chart-*`) so it adapts in light/dark.
 * - **Reusable**: simple props for alternating position + tone.
 */
export function SectionGlowOrb({
  side,
  tone = "cool",
  className,
}: {
  side: GlowSide
  tone?: GlowTone
  className?: string
}) {
  const horizontalAnchorClass =
    side === "left" ? "left-[28%]" : "left-[72%]"

  // Keep the tint subtle so it supports content instead of competing with it.
  // `--chart-1` (blue) pairs nicely with `--chart-4` (blue/purple) in dark mode.
  const colorToken = tone === "cool" ? "var(--chart-1)" : "var(--chart-4)"
  const mixStrength = tone === "cool" ? "12%" : "12%"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -bottom-56 h-[520px] w-[920px] -translate-x-1/2 rounded-full blur-3xl",
        horizontalAnchorClass,
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(closest-side, color-mix(in oklch, ${colorToken} ${mixStrength}, transparent), transparent)`,
      }}
    />
  )
}

