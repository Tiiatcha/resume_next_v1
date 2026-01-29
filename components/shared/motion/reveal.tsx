"use client"

import * as React from "react"
import { motion } from "motion/react"

export function Reveal({
  children,
  className,
  y = 8,
  delaySeconds = 0,
}: {
  children: React.ReactNode
  className?: string
  y?: number
  delaySeconds?: number
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
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
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
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

