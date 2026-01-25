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
  /**
   * Anchor the radial gradient *within a full-width element* instead of positioning
   * a large fixed-width blob.
   *
   * Why:
   * - Fixed-width, translated elements can create horizontal page overflow on mobile.
   * - Hiding overflow at the section level also clips the glow vertically.
   * - A full-width "paint layer" avoids horizontal overflow entirely while still
   *   letting the glow bleed naturally above/below the section.
   */
  const horizontalAnchorPercent = side === "left" ? "28%" : "72%"

  // Keep the tint subtle so it supports content instead of competing with it.
  // `--chart-1` (blue) pairs nicely with `--chart-4` (blue/purple) in dark mode.
  const colorToken = tone === "cool" ? "var(--chart-1)" : "var(--chart-4)"
  const mixStrength = tone === "cool" ? "12%" : "12%"

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Full-width paint layer; does not affect layout and won't cause x-overflow.
        "pointer-events-none absolute inset-x-0 -bottom-56 h-[520px] bg-no-repeat blur-3xl",
        className,
      )}
      style={{
        // Fixed radial size keeps the glow consistent across viewport widths.
        backgroundImage: `radial-gradient(460px 260px at ${horizontalAnchorPercent} 50%, color-mix(in oklch, ${colorToken} ${mixStrength}, transparent), transparent)`,
      }}
    />
  )
}

