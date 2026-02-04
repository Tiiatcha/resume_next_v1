import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FormSelectFieldProps {
  label?: React.ReactNode
  description?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  placeholder?: string
  value?: string
  required?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
  children: React.ReactNode
  id?: string
  containerClassName?: string
  labelClassName?: string
  triggerClassName?: string
  showRequiredIndicator?: boolean
}

/**
 * Shared select field with optional label, supporting text, and error state.
 */
export function FormSelectField({
  label,
  description,
  helperText,
  errorMessage,
  placeholder = "Select one...",
  value,
  required,
  disabled,
  onValueChange,
  children,
  id,
  containerClassName,
  labelClassName,
  triggerClassName,
  showRequiredIndicator = true,
}: FormSelectFieldProps): React.JSX.Element {
  const generatedId = React.useId()
  const resolvedId = id ?? generatedId
  const descriptionId = description ? `${resolvedId}-description` : undefined
  const helperTextId = helperText ? `${resolvedId}-helper-text` : undefined
  const errorId = errorMessage ? `${resolvedId}-error` : undefined
  const ariaDescribedBy =
    [descriptionId, helperTextId, errorId].filter(Boolean).join(" ") || undefined
  const resolvedValue = value === "" ? undefined : value

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

      <Select
        value={resolvedValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={resolvedId}
          className={cn("w-full row-start-3", triggerClassName)}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={ariaDescribedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>

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
