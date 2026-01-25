"use client"

import * as React from "react"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "motion/react"

type NavSectionId = "home" | "about" | "experience" | "projects" | "contact"

type NavItem = {
    id: NavSectionId
    label: string
    /**
     * Use an absolute in-app hash link (`/#section-id`) so the header remains
     * useful on non-home pages (e.g. `/roadmap`).
     */
    href: `/#${NavSectionId}`
}

type HighlightRect = {
    x: number
    y: number
    width: number
    height: number
}

function getUnionRect(a: HighlightRect, b: HighlightRect): HighlightRect {
    const left = Math.min(a.x, b.x)
    const top = Math.min(a.y, b.y)
    const right = Math.max(a.x + a.width, b.x + b.width)
    const bottom = Math.max(a.y + a.height, b.y + b.height)
    return { x: left, y: top, width: right - left, height: bottom - top }
}

export function Header() {
    const [hasScrolled, setHasScrolled] = React.useState(false)
    const [activeSectionId, setActiveSectionId] = React.useState<NavSectionId>("home")
    const [hoveredSectionId, setHoveredSectionId] = React.useState<NavSectionId | null>(null)
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

    const hoverSettleTimeoutRef = React.useRef<number | null>(null)
    const activeSettleTimeoutRef = React.useRef<number | null>(null)
    const previousActiveSectionIdRef = React.useRef<NavSectionId>("home")
    const navLinksHostRef = React.useRef<HTMLDivElement | null>(null)
    const linkRefsById = React.useRef<Record<NavSectionId, HTMLAnchorElement | null>>({
        home: null,
        about: null,
        experience: null,
        projects: null,
        contact: null,
    })

    const navItems: NavItem[] = React.useMemo(
        () => [
            { id: "home", label: "Home", href: "/#home" },
            { id: "about", label: "About", href: "/#about" },
            { id: "experience", label: "Experience", href: "/#experience" },
            { id: "projects", label: "Projects", href: "/#projects" },
            { id: "contact", label: "Contact", href: "/#contact" },
        ],
        [],
    )

    const [highlightRect, setHighlightRect] = React.useState<HighlightRect | null>(null)

    const clearHoverSettleTimeout = React.useCallback(() => {
        if (hoverSettleTimeoutRef.current) {
            window.clearTimeout(hoverSettleTimeoutRef.current)
            hoverSettleTimeoutRef.current = null
        }
    }, [])

    const clearActiveSettleTimeout = React.useCallback(() => {
        if (activeSettleTimeoutRef.current) {
            window.clearTimeout(activeSettleTimeoutRef.current)
            activeSettleTimeoutRef.current = null
        }
    }, [])

    React.useEffect(() => {
        const mediaQueryList = window.matchMedia?.("(prefers-reduced-motion: reduce)")
        if (!mediaQueryList) return

        const syncPreference = () => setPrefersReducedMotion(mediaQueryList.matches)
        syncPreference()

        // Support both modern and older Safari.
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener("change", syncPreference)
            return () => mediaQueryList.removeEventListener("change", syncPreference)
        }

        mediaQueryList.addListener(syncPreference)
        return () => mediaQueryList.removeListener(syncPreference)
    }, [])

    React.useEffect(() => {
        return () => {
            clearHoverSettleTimeout()
            clearActiveSettleTimeout()
        }
    }, [clearActiveSettleTimeout, clearHoverSettleTimeout])

    const getHighlightRectForSectionId = React.useCallback((sectionId: NavSectionId): HighlightRect | null => {
        const host = navLinksHostRef.current
        const link = linkRefsById.current[sectionId]

        if (!host || !link) return null

        const hostRect = host.getBoundingClientRect()
        const linkRect = link.getBoundingClientRect()

        return {
            x: linkRect.left - hostRect.left,
            y: linkRect.top - hostRect.top,
            width: linkRect.width,
            height: linkRect.height,
        }
    }, [])

    const syncHighlightRect = React.useCallback((targetId: NavSectionId) => {
        const rect = getHighlightRectForSectionId(targetId)
        if (rect) setHighlightRect(rect)
    }, [getHighlightRectForSectionId])

    React.useEffect(() => {
        const scrollThresholdPx = 8
        const activeSectionThresholdPx = 160

        function syncScrolledState() {
            setHasScrolled(window.scrollY > scrollThresholdPx)
        }

        function syncActiveSection() {
            // Determine which section is currently "active" based on scroll position.
            // We pick the last section whose top has passed a threshold so the highlight
            // feels stable as you scroll.
            const candidateIds: NavSectionId[] = ["home", "about", "experience", "projects", "contact"]
            const thresholdFromTop = activeSectionThresholdPx

            let newestActiveId: NavSectionId = candidateIds[0]

            for (const candidateId of candidateIds) {
                const section = document.getElementById(candidateId)
                if (!section) continue

                const { top } = section.getBoundingClientRect()
                if (top <= thresholdFromTop) {
                    newestActiveId = candidateId
                } else {
                    // Sections are in DOM order; once one is below threshold, the rest will be too.
                    break
                }
            }

            // Edge case: the last section may never reach the threshold if the document
            // can't scroll far enough (common near the bottom). In that case, treat
            // "at the bottom" as the Contact section being active.
            const viewportBottom = window.scrollY + window.innerHeight
            const documentBottom = document.documentElement.scrollHeight
            if (viewportBottom >= documentBottom - 4) {
                newestActiveId = "contact"
            }

            setActiveSectionId((current) => (current === newestActiveId ? current : newestActiveId))
        }

        function syncHeaderState() {
            syncScrolledState()
            syncActiveSection()
        }

        // Sync once on mount (important for reload mid-page).
        syncHeaderState()

        window.addEventListener("scroll", syncHeaderState, { passive: true })
        return () => window.removeEventListener("scroll", syncHeaderState)
    }, [])

    const sectionMaxWidthClass = "max-w-[calc(72rem+2rem)] sm:max-w-[calc(72rem+3rem)]"
    const topOfPageMaxWidthClass = "max-w-full"

    const headerPaddingClass = hasScrolled ? "p-4" : "p-0"
    const navShapeClass = hasScrolled
        ? "overflow-hidden rounded-full border"
        : "rounded-none border-b"

    // Keep highlight position correct on first render + resize.
    React.useLayoutEffect(() => {
        // Prefer hovered if present; otherwise use active.
        const targetId = hoveredSectionId ?? activeSectionId
        syncHighlightRect(targetId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        // When active changes due to scroll, animate with the same "stretch then snap"
        // behavior as hover (unless the user is currently hovering a link).
        if (hoveredSectionId) return

        clearActiveSettleTimeout()

        const previousActiveId = previousActiveSectionIdRef.current
        previousActiveSectionIdRef.current = activeSectionId

        if (prefersReducedMotion || previousActiveId === activeSectionId) {
            syncHighlightRect(activeSectionId)
            return
        }

        const previousRect = getHighlightRectForSectionId(previousActiveId)
        const nextRect = getHighlightRectForSectionId(activeSectionId)

        if (!previousRect || !nextRect) {
            syncHighlightRect(activeSectionId)
            return
        }

        // Step 1: stretch to cover previous + next.
        setHighlightRect(getUnionRect(previousRect, nextRect))

        // Step 2: settle onto the new active link.
        activeSettleTimeoutRef.current = window.setTimeout(() => {
            syncHighlightRect(activeSectionId)
        }, 140)
    }, [
        activeSectionId,
        clearActiveSettleTimeout,
        getHighlightRectForSectionId,
        hoveredSectionId,
        prefersReducedMotion,
        syncHighlightRect,
    ])

    React.useEffect(() => {
        function handleResize() {
            const targetId = hoveredSectionId ?? activeSectionId
            syncHighlightRect(targetId)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [activeSectionId, hoveredSectionId, syncHighlightRect])

    function handleNavItemHover(sectionId: NavSectionId) {
        clearHoverSettleTimeout()
        clearActiveSettleTimeout()
        const previouslyHighlightedId = hoveredSectionId ?? activeSectionId
        setHoveredSectionId(sectionId)

        // Reduced motion: avoid the stretch/shrink effect and jump directly.
        if (prefersReducedMotion) {
            syncHighlightRect(sectionId)
            return
        }

        const previouslyHighlightedRect = getHighlightRectForSectionId(previouslyHighlightedId)
        const hoveredRect = getHighlightRectForSectionId(sectionId)

        // If we can't measure yet (e.g. first render), fall back to a direct highlight.
        if (!previouslyHighlightedRect || !hoveredRect) {
            syncHighlightRect(sectionId)
            return
        }

        // Step 1: stretch to cover the currently-highlighted link + the newly hovered link.
        // This keeps the animation feeling continuous when moving across multiple links,
        // and also makes "hovering back to the active link" stretch+shrink as expected.
        setHighlightRect(getUnionRect(previouslyHighlightedRect, hoveredRect))

        // Step 2: settle onto the hovered item.
        hoverSettleTimeoutRef.current = window.setTimeout(() => {
            syncHighlightRect(sectionId)
        }, 140)
    }

    function handleNavHoverEnd() {
        clearHoverSettleTimeout()
        clearActiveSettleTimeout()
        setHoveredSectionId(null)
        syncHighlightRect(activeSectionId)
    }

    return (
        <header
            id="header"
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
                    "mx-auto w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/45 flex justify-center",
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
                        // Use a 3-column grid so the middle nav stays *actually centered*
                        // regardless of left/right content widths.
                        "grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-start">
                        <Link
                            href="/"
                            className="text-sm font-semibold tracking-tight whitespace-nowrap"
                        >
                            Craig Davison
                        </Link>
                    </div>

                    <div
                        className="hidden items-center justify-self-center gap-6 text-sm sm:flex"
                        aria-label="Primary"
                    >
                        <div
                            ref={navLinksHostRef}
                            className="relative flex items-center gap-1 rounded-full p-1"
                            onMouseLeave={handleNavHoverEnd}
                            onBlurCapture={(event) => {
                                const nextFocusedTarget = event.relatedTarget
                                const host = event.currentTarget

                                if (nextFocusedTarget instanceof Node && host.contains(nextFocusedTarget)) {
                                    // Focus is still within the nav links host; don't reset.
                                    return
                                }

                                handleNavHoverEnd()
                            }}
                        >
                            {highlightRect ? (
                                <motion.div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute rounded-full bg-foreground/10 ring-1 ring-foreground/10"
                                    style={{ left: 0, top: 0 }}
                                    animate={{
                                        x: highlightRect.x,
                                        y: highlightRect.y,
                                        width: highlightRect.width,
                                        height: highlightRect.height,
                                    }}
                                    transition={{
                                        ...(prefersReducedMotion
                                            ? { duration: 0 }
                                            : {
                                                type: "spring",
                                                stiffness: 520,
                                                damping: 42,
                                                mass: 0.45,
                                            }),
                                    }}
                                />
                            ) : null}

                            {navItems.map((item) => {
                                const isActive = activeSectionId === item.id
                                const isHovered = hoveredSectionId === item.id
                                const isHighlighted = isHovered || (!hoveredSectionId && isActive)

                                return (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        ref={(node) => {
                                            linkRefsById.current[item.id] = node
                                        }}
                                        onMouseEnter={() => handleNavItemHover(item.id)}
                                        onFocus={() => handleNavItemHover(item.id)}
                                        aria-current={isActive ? "page" : undefined}
                                        className={[
                                            "relative z-10 rounded-full px-3 py-1.5 transition-colors",
                                            isHighlighted
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
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