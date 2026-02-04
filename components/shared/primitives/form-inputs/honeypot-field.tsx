import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface HoneypotFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "name" | "id"> {
  /**
   * The DOM `name` attribute to use for this honeypot field.
   *
   * Best practice:
   * - Use something that looks like a plausible form field (e.g. `middleName`, `companyWebsite`)
   * - Avoid obvious names like `honeypot`, `bot`, `spam`, etc.
   */
  name: string
  /**
   * Optional label text. Keep it plausible (e.g. "Middle name") so generic bots are more
   * likely to fill it.
   */
  label?: string
  /**
   * Optional DOM `id`. If omitted, one will be generated.
   */
  id?: string
  /**
   * Wrapper className for layout control when needed.
   */
  containerClassName?: string
}

/**
 * Honeypot field that is:
 * - Hidden from humans (visually clipped) without using `display: none` (which many bots skip)
 * - Hidden from assistive technology (`aria-hidden`)
 *
 * IMPORTANT:
 * - This component is intentionally *uncontrolled* by default. Read its value using `FormData`
 *   in `onSubmit` to catch bots that set `input.value` without triggering React events.
 */
export function HoneypotField({
  name,
  label = "Middle name",
  id,
  className,
  containerClassName,
  autoComplete = "off",
  tabIndex = -1,
  inputMode = "text",
  ...props
}: HoneypotFieldProps): React.JSX.Element {
  const generatedId = React.useId()
  const resolvedId = id ?? generatedId

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Visually hidden (without `display:none`) so bots still encounter the field.
        "absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]",
        containerClassName,
      )}
    >
      <Label htmlFor={resolvedId}>{label}</Label>
      <Input
        {...props}
        id={resolvedId}
        name={name}
        type="text"
        inputMode={inputMode}
        autoComplete={autoComplete}
        tabIndex={tabIndex}
        // Hint to common password managers/extensions to ignore this field.
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
        className={cn(className)}
      />
    </div>
  )
}

