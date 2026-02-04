import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

/**
 * Shared form wrapper that standardizes spacing and validation behavior.
 */
export function Form({
  children,
  className,
  noValidate = true,
  ...props
}: FormProps): React.JSX.Element {
  const baseClasses = "space-y-6 w-full"

  return (
    <form
      {...props}
      noValidate={noValidate}
      className={cn(baseClasses, className)}
    >
      {children}
    </form>
  )
}