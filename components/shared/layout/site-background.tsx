import * as React from "react"

import { cn } from "@/lib/utils"

export function SiteBackground({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative isolate", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-44 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-1)_18%,transparent),transparent)] blur-3xl" />
        <div className="absolute top-[52vh] left-[38%] h-[520px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-4)_16%,transparent),transparent)] blur-3xl" />
      </div>
      {children}
    </div>
  )
}

