import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors",
  {
    variants: {
      variant: {
        violet:
          "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/25 hover:bg-violet-500/15 dark:text-violet-300",
        emerald:
          "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15 dark:text-emerald-300",
        sky: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 hover:bg-sky-500/15 dark:text-sky-300",
        amber:
          "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 hover:bg-amber-500/15 dark:text-amber-300",
        rose: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 hover:bg-rose-500/15 dark:text-rose-300",
        zinc: "bg-zinc-500/10 text-zinc-700 ring-1 ring-zinc-500/20 hover:bg-zinc-500/15 dark:text-zinc-300",
        indigo:
          "bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/20 hover:bg-indigo-500/15 dark:text-indigo-300",
        teal: "bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20 hover:bg-teal-500/15 dark:text-teal-300",
        pink: "bg-pink-500/10 text-pink-700 ring-1 ring-pink-500/20 hover:bg-pink-500/15 dark:text-pink-300",
        orange:
          "bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 hover:bg-orange-500/15 dark:text-orange-300",
      },
    },
    defaultVariants: {
      variant: "violet",
    },
  },
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span
      className={cn(tagVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Tag, tagVariants }

