"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider for Light/Dark/System mode.
 *
 * Non-Tailwind note:
 * - Theme switching is *logic* (next-themes) that toggles a `class="dark"` on <html>.
 * - Styling remains Tailwind v4 + shadcn token utilities (e.g. `bg-background`, `text-foreground`).
 */
export function ThemeProvider(
  props: React.ComponentProps<typeof NextThemesProvider>
) {
  return <NextThemesProvider {...props} />
}

