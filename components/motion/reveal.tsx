"use client"

import * as React from "react"
import { motion } from "motion/react"

/**
 * Minimal "reveal on scroll" wrapper.
 *
 * Non-Tailwind note:
 * - Motion provides the animation runtime.
 * - Layout/spacing/typography is still Tailwind v4 utilities.
 */
export function Reveal({
  children,
  className,
  y = 8,
  delaySeconds = 0,
}: {
  children: React.ReactNode
  className?: string
  /**
   * Initial Y offset in px.
   *
   * Default aligns with Tailwind's `slide-in-from-bottom-2` (0.5rem = 8px)
   * used elsewhere in the project.
   */
  y?: number
  /**
   * Optional delay used for subtle staggering of multiple reveals.
   *
   * Value is in seconds to match Motion's `transition` API.
   */
  delaySeconds?: number
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    // Respect user accessibility settings.
    // If reduced motion is requested, render "in place" immediately.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      setIsInView(true)
      return
    }

    const el = hostRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={hostRef}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      // Match the section-level Tailwind timing (`duration-700`) for a consistent feel.
      transition={{
        duration: 0.7,
        ease: [0.21, 0.45, 0.15, 1],
        delay: delaySeconds,
      }}
    >
      {children}
    </motion.div>
  )
}

