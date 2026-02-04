import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormInputFieldProps
  extends Omit<React.ComponentProps<"input">, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
  showRequiredIndicator?: boolean
  id?: string
}

/**
 * Shared text input field with optional label, supporting text, and error state.
 */
export function FormInputField({
  label,
  description,
  helperText,
  errorMessage,
  containerClassName,
  labelClassName,
  inputClassName,
  showRequiredIndicator = true,
  required,
  id,
  ...props
}: FormInputFieldProps): React.JSX.Element {
  const generatedId = React.useId()
  const resolvedId = id ?? generatedId
  const descriptionId = description ? `${resolvedId}-description` : undefined
  const helperTextId = helperText ? `${resolvedId}-helper-text` : undefined
  const errorId = errorMessage ? `${resolvedId}-error` : undefined
  const ariaDescribedBy =
    [descriptionId, helperTextId, errorId].filter(Boolean).join(" ") || undefined

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

      <Input
        {...props}
        id={resolvedId}
        required={required}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={ariaDescribedBy}
        className={cn("row-start-3", inputClassName)}
      />

      {helperText ? (
        <p
          id={helperTextId}
          className="text-muted-foreground text-xs row-start-4"
        >
          {helperText}
        </p>
      ) : null}

      {errorMessage ? (
        <p id={errorId} className="text-destructive text-xs row-start-4">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}