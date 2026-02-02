"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  initResponsiveCarousel,
  destroyResponsiveCarousel,
} from "@/lib/carousel/responsive-carousel"

/* -----------------------------------------------------------------------------
 * Carousel (root)
 * Wrapper that enables responsive content-aware carousel behaviour when items
 * overflow the viewport. Use with CarouselViewport, CarouselTrack, CarouselItem,
 * and optionally CarouselNavButtons + CarouselPrevious / CarouselNext.
 * -------------------------------------------------------------------------- */

interface CarouselContextValue {
  infinite: boolean
  /** Number of logical rows; each item spans this many so one item = one column. */
  rows: number
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarouselContext(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error("Carousel subcomponents must be used within a Carousel root.")
  }
  return ctx
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  infinite?: boolean
  rows?: number
  /**
   * Enables automatic scrolling when the carousel is active (i.e. when items overflow).
   * Implemented by `lib/carousel/responsive-carousel.ts` via data attributes.
   */
  autoScroll?: boolean
  /**
   * Time between auto-scroll steps in milliseconds.
   * Only used when `autoScroll` is enabled.
   */
  autoScrollIntervalMs?: number
  /**
   * When true, auto-scroll pauses while the user hovers the carousel viewport.
   * Only used when `autoScroll` is enabled.
   */
  autoScrollPauseOnHover?: boolean
}

function Carousel({
  className,
  infinite = false,
  rows = 1,
  autoScroll = false,
  autoScrollIntervalMs,
  autoScrollPauseOnHover = false,
  style,
  children,
  ...props
}: CarouselProps): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.setAttribute("data-infinite", infinite ? "true" : "false")
    initResponsiveCarousel(root)
    return () => destroyResponsiveCarousel(root)
  }, [infinite])

  return (
    <CarouselContext.Provider value={{ infinite, rows }}>
      <div
        ref={rootRef}
        data-carousel
        data-infinite={infinite ? "true" : "false"}
        data-auto-scroll={autoScroll ? "true" : "false"}
        data-auto-scroll-interval={
          typeof autoScrollIntervalMs === "number"
            ? String(autoScrollIntervalMs)
            : undefined
        }
        data-auto-scroll-pause-on-hover={autoScrollPauseOnHover ? "true" : "false"}
        className={cn("group w-full", className)}
        style={{ ...style, "--carousel-rows": rows } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * CarouselNavButtons
 * Wrapper for previous/next buttons. Hidden when content fits; shown when
 * carousel is active. Place before CarouselViewport.
 * -------------------------------------------------------------------------- */

function CarouselNavButtons({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      data-carousel-nav-buttons
      className={cn(
        /**
         * Visibility is controlled via CSS using `[data-carousel-active="true"]` on the root.
         * We intentionally avoid `group-data-[carousel-active=true]:flex` here because Tailwind’s
         * emitted CSS for some variants can be wrapped in `@media (hover:hover)`, which prevents
         * the "active" state from showing in touch / responsive emulation.
         */
        /**
         * Visibility is controlled in `app/(app)/globals.css` using:
         * - `[data-carousel] [data-carousel-nav-buttons] { display: none; }`
         * - `[data-carousel][data-carousel-active="true"] [data-carousel-nav-buttons] { display: flex; }`
         *
         * Keeping visibility in CSS avoids "stuck on" UI states if JS toggles active state
         * or if Tailwind utilities are overridden elsewhere.
         */
        "flex justify-end gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * CarouselPrevious
 * Button that moves to the previous slide. Style with Button or your own.
 * -------------------------------------------------------------------------- */

function CarouselPrevious({
  className,
  children,
  "aria-label": ariaLabel = "Previous slide",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>): React.JSX.Element {
  useCarouselContext()
  return (
    <button
      type="button"
      data-carousel-prev
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&.is-disabled]:cursor-not-allowed [&.is-disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? <ChevronLeftIcon aria-hidden />}
    </button>
  )
}

/* -----------------------------------------------------------------------------
 * CarouselNext
 * Button that moves to the next slide. Style with Button or your own.
 * -------------------------------------------------------------------------- */

function CarouselNext({
  className,
  children,
  "aria-label": ariaLabel = "Next slide",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>): React.JSX.Element {
  useCarouselContext()
  return (
    <button
      type="button"
      data-carousel-next
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&.is-disabled]:cursor-not-allowed [&.is-disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon aria-hidden />}
    </button>
  )
}


function CarouselViewport({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  useCarouselContext()
  return (
    <div
      data-carousel-viewport
      className={cn(

        "w-full overflow-x-hidden overflow-y-hidden py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CarouselTrack({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLUListElement>): React.JSX.Element {
  useCarouselContext()
  const baseClasses =
    "grid grid-flow-col grid-rows-[repeat(var(--carousel-rows),_auto)] w-max justify-start gap-6 list-none p-0 m-0 transition-[transform_400ms_ease-in-out] will-change-transform"
  return (
    <ul
      data-carousel-track
      className={cn(
        baseClasses,
        "auto-cols-[clamp(var(--carousel-slide-min),var(--carousel-slide-ideal),var(--carousel-slide-max))]",
        "group-data-[carousel-active=true]:justify-start group-data-[carousel-active=true]:w-max",
        "max-[40rem]:group-data-[carousel-active=true]:w-full max-[40rem]:group-data-[carousel-active=true]:auto-cols-[100%]",
        className
      )}
      style={{
        /**
         * These are the two "make-or-break" layout declarations for the horizontal grid:
         * - `grid-auto-flow: column` ensures items place left-to-right.
         * - `grid-template-rows: repeat(var(--carousel-rows), auto)` ensures the grid has a finite
         *   row count, so auto-placement wraps into new columns rather than stacking forever.
         *
         * We keep the Tailwind classes too, but pinning these here makes the carousel resilient
         * if anything else in the app (or future refactors) unintentionally overrides the utilities.
         */
        gridAutoFlow: "column",
        gridTemplateRows: "repeat(1, auto)",
        ...style,
      }}
      {...props}
    >
      {children}
    </ul>
  )
}



function CarouselItem({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLLIElement>): React.JSX.Element {
  const { rows } = useCarouselContext()
  return (
    <li
      data-carousel-item
      className={cn("w-full", className)}
      style={{ ...style, gridRow: `span ${rows}` }}
      {...props}
    >
      {children}
    </li>
  )
}

export {
  Carousel,
  CarouselNavButtons,
  CarouselPrevious,
  CarouselNext,
  CarouselViewport,
  CarouselTrack,
  CarouselItem,
}
