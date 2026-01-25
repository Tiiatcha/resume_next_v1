import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80 dark:border-border/40",
        className
      )}
    >
      {children}
    </Badge>
  )
}

