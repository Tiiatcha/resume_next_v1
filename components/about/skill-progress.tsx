"use client"

import * as React from "react"

import { Progress } from "@/components/ui/progress"

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function levelToHue(level: number) {
  // 0..100 -> 10..140 (red/orange -> green)
  const t = clamp01(level / 100)
  return 10 + t * 130
}

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

export function SkillProgress({
  label,
  level,
}: {
  label: string
  /** 0..100 */
  level: number
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const [animatedValue, setAnimatedValue] = React.useState(0)

  React.useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const prefersReducedMotion = getPrefersReducedMotion()
    if (prefersReducedMotion) {
      setAnimatedValue(level)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Single-shot animation: 0 -> level (Progress has transition on indicator)
          setAnimatedValue(level)
          observer.disconnect()
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [level])

  const hue = levelToHue(level)
  const start = `hsl(${hue} 85% 55%)`
  const end = `hsl(${Math.min(hue + 18, 160)} 85% 48%)`

  return (
    <div ref={hostRef} className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {Math.round(level)}%
        </p>
      </div>

      <Progress
        value={animatedValue}
        className="h-2.5 bg-black/5 dark:bg-white/10"
        indicatorClassName="transition-[transform] duration-700 ease-out"
        indicatorStyle={{
          backgroundImage: `linear-gradient(90deg, ${start}, ${end})`,
        }}
        aria-label={`${label} proficiency ${Math.round(level)}%`}
      />
    </div>
  )
}

