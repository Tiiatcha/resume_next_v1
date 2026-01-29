import * as React from "react"

import { cn } from "@/lib/utils"

type GlowSide = "left" | "right"
type GlowTone = "cool" | "warm"

export function SectionGlowOrb({
  side,
  tone = "cool",
  className,
}: {
  side: GlowSide
  tone?: GlowTone
  className?: string
}) {
  const horizontalAnchorPercent = side === "left" ? "28%" : "72%"
  const colorToken = tone === "cool" ? "var(--chart-1)" : "var(--chart-4)"
  const mixStrength = "12%"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 -bottom-56 h-[520px] bg-no-repeat blur-3xl",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(460px 260px at ${horizontalAnchorPercent} 50%, color-mix(in oklch, ${colorToken} ${mixStrength}, transparent), transparent)`,
      }}
    />
  )
}

