import * as React from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface FormTextareaFieldProps
  extends Omit<React.ComponentProps<"textarea">, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  footer?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  textareaClassName?: string
  showRequiredIndicator?: boolean
  id?: string
}

/**
 * Shared textarea field with optional label, supporting text, and error state.
 */
export function FormTextareaField({
  label,
  description,
  helperText,
  errorMessage,
  footer,
  containerClassName,
  labelClassName,
  textareaClassName,
  showRequiredIndicator = true,
  required,
  id,
  ...props
}: FormTextareaFieldProps): React.JSX.Element {
  const generatedId = React.useId()
  const resolvedId = id ?? generatedId
  const descriptionId = description ? `${resolvedId}-description` : undefined
  const helperTextId = helperText ? `${resolvedId}-helper-text` : undefined
  const errorId = errorMessage ? `${resolvedId}-error` : undefined
  const ariaDescribedBy =
    [descriptionId, helperTextId, errorId].filter(Boolean).join(" ") || undefined
  const supportingContent = [helperText, errorMessage, footer].filter(Boolean)

  return (
    <div
      className={cn(
        "grid grid-rows-subgrid row-span-4 gap-1.5",
        containerClassName,
      )}
    >
      {label ? (
        <Label
          className={cn(
            "text-sm font-medium text-foreground row-start-1",
            labelClassName,
          )}
          htmlFor={resolvedId}
        >
          {label}
          {required && showRequiredIndicator ? (
            <span className="text-destructive">*</span>
          ) : null}
        </Label>
      ) : null}

      {description ? (
        <p
          id={descriptionId}
          className="text-muted-foreground text-xs leading-relaxed row-start-2"
        >
          {description}
        </p>
      ) : null}

      <Textarea
        {...props}
        id={resolvedId}
        required={required}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={ariaDescribedBy}
        className={cn("row-start-3", textareaClassName)}
      />

      {supportingContent.length > 0 ? (
        <div className="row-start-4 space-y-1">
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
          {footer ? footer : null}
        </div>
      ) : null}
    </div>
  )
}
