import * as React from "react";
import { cn } from "@/lib/utils";
import type ElementProps from "@/interfaces/element-props";
import { SectionGlowOrb } from "@/components/layout/section-glow-orb";

type SectionVariant = "default" | "tight" | "loose";

type GlowSide = "left" | "right";
type GlowTone = "cool" | "warm";

export interface SectionProps extends Omit<ElementProps<HTMLElement>, "variant"> {
  /**
   * Vertical spacing preset for the section wrapper.
   *
   * - `default`: comfortable spacing between sections.
   * - `loose`: slightly tighter than default (useful for paired sections).
   * - `tight`: minimal padding (useful for small blocks like the stack marquee).
   */
  variant?: SectionVariant;

  /**
   * Optional decorative background glow used to add depth per section.
   *
   * When provided, the glow is rendered behind content and is `aria-hidden`.
   */
  glow?: {
    side: GlowSide;
    tone?: GlowTone;
    className?: string;
  };

  /**
   * Enable the default "reveal" animation classes.
   *
   * These were previously applied in `app/page.tsx` wrappers. Keeping them here
   * ensures consistent motion behavior across sections.
   */
  reveal?: boolean;
}

/**
 * Consistent top-level section wrapper for the CV page.
 *
 * Provides:
 * - Predictable vertical spacing via `variant`
 * - A consistent anchor offset for hash navigation via `scroll-mt-*`
 * - A centered flex layout so inner containers can opt into left/center alignment
 */
export default function Section({
  children,
  className,
  variant = "default",
  glow,
  reveal = true,
  ...props
}: SectionProps): React.JSX.Element {
  const baseClasses =
    /**
     * Note on overflow:
     * - We intentionally avoid `overflow-hidden` here because section-level clipping
     *   will cut off decorative background glows (top/bottom).
     * - Horizontal overflow should be prevented by ensuring decorative elements do
     *   not create x-overflow (see `SectionGlowOrb`) and by handling any component-
     *   specific overflow at the component level (e.g. marquees).
     */
    "w-full scroll-mt-24 flex flex-col items-center justify-center px-4 gap-4";
  const variants: Record<SectionVariant, string> = {
    default: `${baseClasses} py-12`,
    tight: `${baseClasses} py-2`,
    loose: `${baseClasses} py-6`,
  };

  const revealClasses = reveal
    ? "animate-in fade-in slide-in-from-bottom-2 duration-700"
    : undefined;

  return (
    <section
      className={cn("relative isolate", variants[variant], revealClasses, className)}
      {...props}
    >
      {glow ? (
        <SectionGlowOrb
          side={glow.side}
          tone={glow.tone}
          className={cn("z-0", glow.className)}
        />
      ) : null}

      {/* 
        Keep children as-is for layout purposes.
        `contents` preserves the section's flex spacing between direct children,
        while allowing us to set a single z-index context above the glow.
      */}
      {children}
    </section>
  );
}
