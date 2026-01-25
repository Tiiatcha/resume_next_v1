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
  y = 10,
}: {
  children: React.ReactNode
  className?: string
  /** Initial Y offset in px. Keep small for a calm, premium feel. */
  y?: number
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
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
      transition={{ duration: 0.5, ease: [0.21, 0.45, 0.15, 1] }}
    >
      {children}
    </motion.div>
  )
}

