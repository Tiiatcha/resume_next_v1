import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormCheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "id"> {
  label: React.ReactNode
  description?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  containerClassName?: string
  rowClassName?: string
  labelClassName?: string
  checkboxClassName?: string
  showRequiredIndicator?: boolean
  id?: string
}

/**
 * Shared checkbox field with optional supporting text and error state.
 */
export function FormCheckboxField({
  label,
  description,
  helperText,
  errorMessage,
  containerClassName,
  rowClassName,
  labelClassName,
  checkboxClassName,
  showRequiredIndicator = true,
  required,
  id,
  ...props
}: FormCheckboxFieldProps): React.JSX.Element {
  const generatedId = React.useId()
  const resolvedId = id ?? generatedId
  const descriptionId = description ? `${resolvedId}-description` : undefined
  const helperTextId = helperText ? `${resolvedId}-helper-text` : undefined
  const errorId = errorMessage ? `${resolvedId}-error` : undefined
  const ariaDescribedBy =
    [descriptionId, helperTextId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <div className={cn("flex items-start gap-2", rowClassName)}>
        <Checkbox
          {...props}
          id={resolvedId}
          required={required}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={ariaDescribedBy}
          className={cn("mt-[1px]", checkboxClassName)}
        />
        <div className="space-y-1">
          <Label
            className={cn("text-sm text-foreground", labelClassName)}
            htmlFor={resolvedId}
          >
            {label}
            {required && showRequiredIndicator ? (
              <span className="text-destructive">*</span>
            ) : null}
          </Label>
          {description ? (
            <p
              id={descriptionId}
              className="text-muted-foreground text-xs leading-relaxed"
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {helperText ? (
        <p id={helperTextId} className="text-muted-foreground text-xs">
          {helperText}
        </p>
      ) : null}

      {errorMessage ? (
        <p id={errorId} className="text-destructive text-xs">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
