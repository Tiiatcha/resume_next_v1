"use client"

import * as React from "react"

import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
    const [hasScrolled, setHasScrolled] = React.useState(false)

    React.useEffect(() => {
        const scrollThresholdPx = 8

        function syncScrolledState() {
            setHasScrolled(window.scrollY > scrollThresholdPx)
        }

        // Sync once on mount (important for reload mid-page).
        syncScrolledState()

        window.addEventListener("scroll", syncScrolledState, { passive: true })
        return () => window.removeEventListener("scroll", syncScrolledState)
    }, [])

    // Keep this in sync with `app/page.tsx` content width so the nav aligns
    // with the main page sections once the user starts scrolling.
    const sectionMaxWidthClass = "max-w-6xl"
    // Important: avoid `max-w-none` here because transitioning from `none` -> a length
    // is not animatable. Using `max-w-full` keeps the "full width" look while allowing
    // smooth interpolation to `max-w-6xl`.
    const topOfPageMaxWidthClass = "max-w-full"

    // Layout behavior:
    // - Top-of-page: full-width bar (no rounding), aligned to viewport edges.
    // - Scrolled: inset pill (rounded-full) that matches the page content width.
    const headerPaddingClass = hasScrolled ? "p-4" : "p-0"
    const navShapeClass = hasScrolled
        ? "overflow-hidden rounded-full border"
        : "rounded-none border-b"

    return (
        <header
            className={[
                "sticky top-0 z-50 w-full",
                // Animate the inset/outset feel when we add/remove padding on scroll.
                "transition-[padding] duration-300 ease-out motion-reduce:transition-none",
                "will-change-[padding]",
                headerPaddingClass,
            ].join(" ")}
        >
            <nav
                className={[
                    // Center the pill and animate the pill width (not just the inner content).
                    "mx-auto w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/45",
                    navShapeClass,
                    // `transition-all` is intentional: it reliably animates `max-width`,
                    // `border-radius`, and the header's padding change without requiring
                    // comma-separated arbitrary transition properties.
                    "transition-all duration-300 ease-out motion-reduce:transition-none",
                    "will-change-[max-width]",
                    hasScrolled ? sectionMaxWidthClass : topOfPageMaxWidthClass,
                ].join(" ")}
            >
                <div
                    className={[
                        "flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6",
                    ].join(" ")}
                >
                    <a href="#" className="text-sm font-semibold tracking-tight">
                        Craig Davison
                    </a>
                    <div className="hidden items-center gap-6 text-sm sm:flex" aria-label="Primary">
                        <a className="text-muted-foreground hover:text-foreground" href="#about">
                            About
                        </a>
                        <a className="text-muted-foreground hover:text-foreground" href="#experience">
                            Experience
                        </a>
                        <a className="text-muted-foreground hover:text-foreground" href="#projects">
                            Projects
                        </a>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            className="text-muted-foreground hover:text-foreground text-sm font-medium"
                            href="/assets/documents/Craig%20Davison%20CV%20Oct%202024.pdf"
                            download="Craig-Davison-CV.pdf"
                        >
                            Download CV
                        </a>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    )
}