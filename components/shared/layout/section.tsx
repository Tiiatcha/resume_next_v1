import * as React from "react"

import { cn } from "@/lib/utils"
import type ElementProps from "@/interfaces/element-props"
import { SectionGlowOrb } from "@/components/shared/layout/section-glow-orb"

type SectionVariant = "default" | "tight" | "loose"
type GlowSide = "left" | "right"
type GlowTone = "cool" | "warm"
type SectionSurface = "base" | "alt" | "featured"

export interface SectionProps extends Omit<ElementProps<HTMLElement>, "variant"> {
  variant?: SectionVariant
  surface?: SectionSurface
  glow?: {
    side: GlowSide
    tone?: GlowTone
    className?: string
  }
  reveal?: boolean
}

export default function Section({
  children,
  className,
  variant = "default",
  surface = "base",
  glow,
  reveal = true,
  ...props
}: SectionProps): React.JSX.Element {
  const baseClasses =
    "w-full scroll-mt-24 flex flex-col items-center justify-center px-4 gap-4"

  const variants: Record<SectionVariant, string> = {
    default: `${baseClasses} py-12`,
    tight: `${baseClasses} py-2`,
    loose: `${baseClasses} py-6`,
  }

  const surfaces: Record<SectionSurface, string> = {
    base: "bg-transparent",
    alt: "bg-muted/20 border-y border-border/60 supports-[backdrop-filter]:backdrop-blur-sm",
    featured:
      "bg-indigo-500/6 dark:bg-indigo-500/10 border-y border-indigo-500/15 dark:border-indigo-500/20 supports-[backdrop-filter]:backdrop-blur-sm",
  }

  const revealClasses = reveal
    ? "animate-in fade-in slide-in-from-bottom-2 duration-700"
    : undefined

  return (
    <section
      className={cn(
        "relative isolate",
        surfaces[surface],
        variants[variant],
        revealClasses,
        className,
      )}
      {...props}
    >
      {glow ? (
        <SectionGlowOrb
          side={glow.side}
          tone={glow.tone}
          className={cn("z-0", glow.className)}
        />
      ) : null}
      {children}
    </section>
  )
}

