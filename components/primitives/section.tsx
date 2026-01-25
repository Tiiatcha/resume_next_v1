import * as React from "react"

import { cn } from "@/lib/utils"

export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-10 sm:py-14", className)}
    >
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground max-w-prose text-pretty leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  )
}

