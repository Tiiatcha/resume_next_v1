/**
 * Responsive content-aware carousel logic.
 *
 * Ported from HTML_DEMOS/Responsive Carousel. Enables carousel behaviour only when
 * items overflow the viewport; supports finite and infinite modes; handles resize,
 * swipe, keyboard, and reduced motion. Use with the composable Carousel components
 * in components/shared/composites/carousel.tsx.
 */

/** Must match the transition used in carousel CSS for the track. */
const TRANSITION_DURATION_MS = 400
const TRANSITION_EASING = 'ease-in-out'
const TRANSITION = `transform ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING}`

/** Selectors used to find carousel parts inside the root (aligned with component markup). */
export const CAROUSEL_SELECTORS = {
  viewport: '[data-carousel-viewport]',
  track: '[data-carousel-track]',
  prev: '[data-carousel-prev]',
  next: '[data-carousel-next]',
  navButtons: '[data-carousel-nav-buttons]',
} as const

export interface CarouselState {
  root: HTMLElement
  track: HTMLElement
  viewport: HTMLElement
  prevBtn: HTMLElement
  nextBtn: HTMLElement
  navButtons: HTMLElement | null
  items: HTMLElement[]
  totalItems: number
  currentItemIndex: number
  stepWidth: number
  isInfinite: boolean
  isAnimating: boolean
  slideDirection: 'next' | 'prev' | null
  hasInfiniteClones: boolean
  isEnabled: boolean
  isReducedMotion: boolean
  hasEventListeners: boolean
  hasSwipeListeners: boolean
  hasTransitionEndListener: boolean
  lastRequestedTranslateX: number
  resizeObserver: ResizeObserver | null
  mutationObserver: MutationObserver | null
  pendingResizeFrameId: number | null
  isResizing: boolean
  resizeTransitionRestoreTimeoutId: ReturnType<typeof setTimeout> | null
  activePointerId: number | null
  pointerStartX: number
  pointerStartY: number
  hasDeterminedSwipeAxis: boolean
  isSwipeGesture: boolean
  /**
   * Infinite-mode cloning can run before React content has fully painted (fonts, hydration,
   * async content). We retry a few times before giving up.
   */
  cloneRetryCount: number

  /** Auto-scroll configuration derived from root data attributes. */
  autoScrollEnabled: boolean
  /** Last observed `data-auto-scroll` value (for detecting explicit re-enable). */
  autoScrollAttributeEnabled: boolean
  autoScrollIntervalMs: number
  autoScrollPauseOnHover: boolean
  autoScrollTimerId: ReturnType<typeof setTimeout> | null
  autoScrollIsPaused: boolean
  /**
   * When the user manually navigates (click/swipe), we disable auto-scroll for the remainder
   * of this carousel instance lifecycle. This prevents "fighting the user".
   *
   * Auto-scroll can be re-enabled by toggling `data-auto-scroll` off and back on.
   */
  autoScrollDisabledByUser: boolean
  hasAutoScrollHoverListeners: boolean
  onAutoScrollMouseEnter: ((event: MouseEvent) => void) | null
  onAutoScrollMouseLeave: ((event: MouseEvent) => void) | null
}

const stateByRoot = new WeakMap<HTMLElement, CarouselState>()

function getState(root: HTMLElement): CarouselState | undefined {
  return stateByRoot.get(root)
}

function createState(root: HTMLElement): CarouselState {
  const track = root.querySelector<HTMLElement>(CAROUSEL_SELECTORS.track)
  const viewport = root.querySelector<HTMLElement>(CAROUSEL_SELECTORS.viewport)
  const prevBtn = root.querySelector<HTMLElement>(CAROUSEL_SELECTORS.prev)
  const nextBtn = root.querySelector<HTMLElement>(CAROUSEL_SELECTORS.next)
  const navButtons = root.querySelector<HTMLElement>(CAROUSEL_SELECTORS.navButtons)

  if (!track || !viewport || !prevBtn || !nextBtn) {
    throw new Error(
      'Carousel root must contain [data-carousel-viewport], [data-carousel-track], [data-carousel-prev], and [data-carousel-next].'
    )
  }

  const state: CarouselState = {
    root,
    track,
    viewport,
    prevBtn,
    nextBtn,
    navButtons,
    items: [],
    totalItems: 0,
    currentItemIndex: 0,
    stepWidth: 0,
    isInfinite: root.getAttribute('data-infinite') === 'true',
    isAnimating: false,
    slideDirection: null,
    hasInfiniteClones: false,
    isEnabled: false,
    isReducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hasEventListeners: false,
    hasSwipeListeners: false,
    hasTransitionEndListener: false,
    lastRequestedTranslateX: 0,
    resizeObserver: null,
    mutationObserver: null,
    pendingResizeFrameId: null,
    isResizing: false,
    resizeTransitionRestoreTimeoutId: null,
    activePointerId: null,
    pointerStartX: 0,
    pointerStartY: 0,
    hasDeterminedSwipeAxis: false,
    isSwipeGesture: false,
    cloneRetryCount: 0,

    autoScrollEnabled: root.getAttribute('data-auto-scroll') === 'true',
    autoScrollAttributeEnabled: root.getAttribute('data-auto-scroll') === 'true',
    autoScrollIntervalMs: 5000,
    autoScrollPauseOnHover: root.getAttribute('data-auto-scroll-pause-on-hover') === 'true',
    autoScrollTimerId: null,
    autoScrollIsPaused: false,
    autoScrollDisabledByUser: false,
    hasAutoScrollHoverListeners: false,
    onAutoScrollMouseEnter: null,
    onAutoScrollMouseLeave: null,
  }

  stateByRoot.set(root, state)
  return state
}

function parseAutoScrollIntervalMs(rawValue: string | null | undefined): number {
  if (!rawValue) return 5000
  const trimmed = rawValue.trim().toLowerCase()
  if (!trimmed) return 5000

  // Support `5000`, `5000ms`, `5s`.
  if (trimmed.endsWith('ms')) {
    const ms = Number.parseFloat(trimmed.slice(0, -2))
    return Number.isFinite(ms) ? ms : 5000
  }
  if (trimmed.endsWith('s')) {
    const seconds = Number.parseFloat(trimmed.slice(0, -1))
    return Number.isFinite(seconds) ? seconds * 1000 : 5000
  }

  const numeric = Number(trimmed)
  return Number.isFinite(numeric) ? numeric : 5000
}

function syncAutoScrollConfigFromRoot(state: CarouselState): void {
  const attributeEnabled = state.root.getAttribute('data-auto-scroll') === 'true'
  /**
   * If the user explicitly toggles auto-scroll off and then back on (attribute change),
   * treat that as an explicit re-enable and clear the "disabled by user" latch.
   */
  if (state.autoScrollAttributeEnabled !== attributeEnabled) {
    if (attributeEnabled) {
      state.autoScrollDisabledByUser = false
      state.autoScrollIsPaused = false
    }
    state.autoScrollAttributeEnabled = attributeEnabled
  }

  state.autoScrollEnabled = attributeEnabled && !state.autoScrollDisabledByUser
  state.autoScrollPauseOnHover = state.root.getAttribute('data-auto-scroll-pause-on-hover') === 'true'
  state.autoScrollIntervalMs = parseAutoScrollIntervalMs(state.root.getAttribute('data-auto-scroll-interval'))
}

function disableAutoScrollDueToUserInteraction(state: CarouselState): void {
  if (!state.autoScrollEnabled && state.autoScrollDisabledByUser) return
  state.autoScrollDisabledByUser = true
  state.autoScrollIsPaused = false
  stopAutoScroll(state)
}

function stopAutoScroll(state: CarouselState): void {
  if (state.autoScrollTimerId) {
    clearTimeout(state.autoScrollTimerId)
    state.autoScrollTimerId = null
  }
}

function ensureAutoScrollHoverListeners(state: CarouselState): void {
  if (state.hasAutoScrollHoverListeners) return

  state.onAutoScrollMouseEnter = () => {
    if (!state.autoScrollPauseOnHover) return
    state.autoScrollIsPaused = true
    stopAutoScroll(state)
  }

  state.onAutoScrollMouseLeave = () => {
    if (!state.autoScrollPauseOnHover) return
    state.autoScrollIsPaused = false
    scheduleAutoScrollTick(state)
  }

  state.viewport.addEventListener('mouseenter', state.onAutoScrollMouseEnter)
  state.viewport.addEventListener('mouseleave', state.onAutoScrollMouseLeave)
  state.hasAutoScrollHoverListeners = true
}

function scheduleAutoScrollTick(state: CarouselState): void {
  stopAutoScroll(state)

  if (!state.isEnabled) return
  if (!state.autoScrollEnabled) return
  if (state.isReducedMotion) return
  if (state.autoScrollIsPaused) return

  const minIntervalMs = 250
  const intervalMs = Math.max(minIntervalMs, state.autoScrollIntervalMs)

  state.autoScrollTimerId = setTimeout(() => {
    if (!state.isEnabled || !state.autoScrollEnabled) return
    if (state.autoScrollIsPaused) return

    getItems(state)

    // Finite: stop once we've reached the end (index-based navigation).
    if (!state.isInfinite && state.currentItemIndex >= state.totalItems - 1) {
      stopAutoScroll(state)
      return
    }

    moveNext(state)
    scheduleAutoScrollTick(state)
  }, intervalMs)
}

function getItems(state: CarouselState): void {
  const items = Array.from(state.track.children) as HTMLElement[]
  state.items = items
  state.totalItems = items.length
  state.stepWidth = getStepWidth(state)
}

function getGap(state: CarouselState): number {
  const styles = getComputedStyle(state.track)
  const gap = parseFloat(styles.columnGap || styles.gap) || 0
  return gap
}

function getItemWidth(state: CarouselState): number {
  return parseFloat(getComputedStyle(state.items[0]).width)
}

function getStepWidth(state: CarouselState): number {
  return getItemWidth(state) + getGap(state)
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getNonInfiniteScrollBounds(state: CarouselState): {
  maxScrollPx: number
  minTranslateX: number
  maxTranslateX: number
} {
  const maxScrollPx = Math.max(0, state.track.scrollWidth - state.viewport.clientWidth)
  return {
    maxScrollPx,
    minTranslateX: -maxScrollPx,
    maxTranslateX: 0,
  }
}

function getCurrentTranslatePosition(state: CarouselState): number {
  const style = getComputedStyle(state.track)
  const matrix = style.transform || (style as CSSStyleDeclaration & { webkitTransform?: string }).webkitTransform
  if (!matrix || matrix === 'none') return 0
  const match = matrix.match(/matrix.*\((.+)\)/)
  if (!match) return 0
  const values = match[1].split(', ')
  return parseFloat(values[4] ?? '0')
}

function forceReflow(element: HTMLElement): void {
  void element.offsetHeight
}

function disableTrackTransition(state: CarouselState): void {
  state.track.style.transition = 'none'
}

function restoreTrackTransition(state: CarouselState): void {
  state.track.style.transition = TRANSITION
}

function setTransition(state: CarouselState): void {
  state.track.style.transition = TRANSITION
}

function rotateFirstItemToEnd(state: CarouselState): void {
  const first = state.track.firstElementChild
  if (!first) return
  state.track.appendChild(first)
}

function rotateLastItemToStart(state: CarouselState): void {
  const last = state.track.lastElementChild
  if (!last) return
  state.track.insertBefore(last, state.track.firstElementChild)
}

function snapTrackToOrigin(state: CarouselState): void {
  disableTrackTransition(state)
  state.track.style.transform = 'translateX(0px)'
  forceReflow(state.track)
  restoreTrackTransition(state)
}

function moveNonInfiniteTrackToFocusedItem(state: CarouselState): void {
  getItems(state)
  const focused = state.items[state.currentItemIndex]
  if (!focused) return
  const desiredTranslateX = -focused.offsetLeft
  const { minTranslateX, maxTranslateX } = getNonInfiniteScrollBounds(state)
  const clamped = clampNumber(desiredTranslateX, minTranslateX, maxTranslateX)
  state.track.style.transform = `translateX(${clamped}px)`
  state.lastRequestedTranslateX = clamped
}

function setButtonStates(state: CarouselState): void {
  if (state.isInfinite) {
    state.nextBtn.classList.remove('is-disabled')
    state.prevBtn.classList.remove('is-disabled')
    return
  }
  const { maxScrollPx } = getNonInfiniteScrollBounds(state)
  const currentTranslateX =
    typeof state.lastRequestedTranslateX === 'number'
      ? state.lastRequestedTranslateX
      : getCurrentTranslatePosition(state)
  const epsilon = 0.5
  const isAtStart = currentTranslateX >= -epsilon
  const isAtEnd = -currentTranslateX >= maxScrollPx - epsilon
  if (isAtStart) state.prevBtn.classList.add('is-disabled')
  else state.prevBtn.classList.remove('is-disabled')
  if (isAtEnd) state.nextBtn.classList.add('is-disabled')
  else state.nextBtn.classList.remove('is-disabled')
}

function moveNext(state: CarouselState): void {
  getItems(state)
  if (state.isInfinite) {
    moveNextInfinite(state)
    return
  }
  if (state.currentItemIndex >= state.totalItems - 1) {
    setButtonStates(state)
    return
  }
  state.currentItemIndex += 1
  moveNonInfiniteTrackToFocusedItem(state)
  setButtonStates(state)
}

function movePrev(state: CarouselState): void {
  getItems(state)
  if (state.isInfinite) {
    movePrevInfinite(state)
    return
  }
  if (state.currentItemIndex <= 0) {
    setButtonStates(state)
    return
  }
  state.currentItemIndex -= 1
  moveNonInfiniteTrackToFocusedItem(state)
  setButtonStates(state)
}

function moveNextInfinite(state: CarouselState): void {
  if (state.isAnimating) return
  if (state.isReducedMotion) {
    rotateFirstItemToEnd(state)
    snapTrackToOrigin(state)
    return
  }
  state.isAnimating = true
  state.slideDirection = 'next'
  state.track.style.transform = `translateX(${-state.stepWidth}px)`
}

function movePrevInfinite(state: CarouselState): void {
  if (state.isAnimating) return
  if (state.isReducedMotion) {
    rotateLastItemToStart(state)
    snapTrackToOrigin(state)
    return
  }
  state.isAnimating = true
  state.slideDirection = 'prev'
  disableTrackTransition(state)
  rotateLastItemToStart(state)
  state.track.style.transform = `translateX(${-state.stepWidth}px)`
  forceReflow(state.track)
  restoreTrackTransition(state)
  requestAnimationFrame(() => {
    state.track.style.transform = 'translateX(0px)'
  })
}

function cloneItemsForInfiniteScroll(state: CarouselState): void {
  if (state.hasInfiniteClones) return
  getItems(state)
  const originals = state.items

  /**
   * React/Next can render the list items first and then populate their contents in a
   * subsequent paint. Cloning too early would produce structurally empty clones.
   *
   * We treat "has at least one element child" as the signal that content has painted.
   */
  const hasPaintedContent = originals.some((item) => item.childElementCount > 0)
  if (!hasPaintedContent && state.cloneRetryCount < 10) {
    state.cloneRetryCount += 1
    requestAnimationFrame(() => {
      cloneItemsForInfiniteScroll(state)
    })
    return
  }

  // Reset once we commit to cloning.
  state.cloneRetryCount = 0

  originals.forEach((item, index) => {
    item.dataset.copy = 'original'
    if (!item.dataset.originalIndex) item.dataset.originalIndex = String(index)
  })
  const clones = originals.map((item) => {
    const originalChildCount = item.childElementCount
    const originalNodeCount = item.childNodes.length
    const clone = item.cloneNode(true) as HTMLElement
    clone.dataset.copy = 'clone'
    clone.dataset.originalIndex = item.dataset.originalIndex ?? ''
    // Debug attributes to verify clone integrity in DevTools.
    clone.dataset.debugOriginalChildCount = String(originalChildCount)
    clone.dataset.debugOriginalNodeCount = String(originalNodeCount)
    clone.dataset.debugCloneChildCount = String(clone.childElementCount)
    clone.dataset.debugCloneNodeCount = String(clone.childNodes.length)
    clone.setAttribute('aria-hidden', 'true')
    clone.setAttribute('role', 'presentation')
    return clone
  })
  clones.forEach((el) => state.track.appendChild(el))
  state.hasInfiniteClones = true
}

function removeClones(state: CarouselState): void {
  const clones = state.track.querySelectorAll('[data-copy="clone"]')
  clones.forEach((c) => c.remove())
}

function restoreOriginalItemOrder(state: CarouselState): void {
  const originals = state.track.querySelectorAll('[data-copy="original"]')
  if (!originals.length) return
  Array.from(originals)
    .sort((a, b) => Number((a as HTMLElement).dataset.originalIndex) - Number((b as HTMLElement).dataset.originalIndex))
    .forEach((item) => state.track.appendChild(item))
}

function initInfiniteCarousel(state: CarouselState): void {
  cloneItemsForInfiniteScroll(state)
  state.track.style.transform = 'translateX(0px)'
}

function enableCarousel(state: CarouselState): void {
  state.root.setAttribute('data-carousel-active', 'true')
  setTransition(state)
  if (state.isResizing) disableTrackTransition(state)
  state.isEnabled = true
}

function disableCarousel(state: CarouselState): void {
  state.root.removeAttribute('data-carousel-active')
  state.isEnabled = false
  state.isAnimating = false
  state.slideDirection = null
  state.currentItemIndex = 0
  state.lastRequestedTranslateX = 0
  if (state.resizeTransitionRestoreTimeoutId) {
    clearTimeout(state.resizeTransitionRestoreTimeoutId)
    state.resizeTransitionRestoreTimeoutId = null
  }
  state.isResizing = false
  disableTrackTransition(state)
  state.track.style.transform = 'translateX(0px)'
  forceReflow(state.track)
  restoreTrackTransition(state)
  if (state.hasInfiniteClones) {
    removeClones(state)
    restoreOriginalItemOrder(state)
    state.hasInfiniteClones = false
  }
}

function ensureCarouselEventListeners(state: CarouselState): void {
  if (state.hasEventListeners) return
  state.prevBtn.addEventListener('click', () => {
    if (!state.isEnabled) return
    disableAutoScrollDueToUserInteraction(state)
    movePrev(state)
  })
  state.nextBtn.addEventListener('click', () => {
    if (!state.isEnabled) return
    disableAutoScrollDueToUserInteraction(state)
    moveNext(state)
  })
  state.hasEventListeners = true
}

function ensureCarouselSwipeListeners(state: CarouselState): void {
  if (state.hasSwipeListeners) return
  const slopPx = 6
  const swipeThresholdPx = 35

  state.viewport.addEventListener('pointerdown', (event: PointerEvent) => {
    if (!state.isEnabled || state.isAnimating || event.isPrimary === false) return
    state.activePointerId = event.pointerId
    state.pointerStartX = event.clientX
    state.pointerStartY = event.clientY
    state.hasDeterminedSwipeAxis = false
    state.isSwipeGesture = false
    state.viewport.setPointerCapture(event.pointerId)
  })

  state.viewport.addEventListener(
    'pointermove',
    (event: PointerEvent) => {
      if (!state.isEnabled || state.activePointerId !== event.pointerId) return
      const deltaX = event.clientX - state.pointerStartX
      const deltaY = event.clientY - state.pointerStartY
      if (!state.hasDeterminedSwipeAxis) {
        if (Math.abs(deltaX) < slopPx && Math.abs(deltaY) < slopPx) return
        state.hasDeterminedSwipeAxis = true
        state.isSwipeGesture = Math.abs(deltaX) > Math.abs(deltaY)
      }
      if (!state.isSwipeGesture) return
      event.preventDefault()
    },
    { passive: false }
  )

  state.viewport.addEventListener('pointerup', (event: PointerEvent) => {
    if (state.activePointerId !== event.pointerId) return
    const deltaX = event.clientX - state.pointerStartX
    const deltaY = event.clientY - state.pointerStartY
    state.activePointerId = null
    if (!state.isSwipeGesture) return
    if (Math.abs(deltaX) < swipeThresholdPx || Math.abs(deltaX) < Math.abs(deltaY)) return
    disableAutoScrollDueToUserInteraction(state)
    if (deltaX < 0) moveNext(state)
    else movePrev(state)
  })

  state.viewport.addEventListener('pointercancel', (event: PointerEvent) => {
    if (state.activePointerId === event.pointerId) state.activePointerId = null
  })

  state.hasSwipeListeners = true
}

function ensureTransitionEndListener(state: CarouselState): void {
  if (state.hasTransitionEndListener) return
  state.track.addEventListener('transitionend', (event: TransitionEvent) => {
    if (event.target !== state.track || event.propertyName !== 'transform') return
    if (!state.isInfinite || !state.slideDirection) return
    if (state.slideDirection === 'next') {
      rotateFirstItemToEnd(state)
      snapTrackToOrigin(state)
    }
    if (state.slideDirection === 'prev') snapTrackToOrigin(state)
    state.slideDirection = null
    state.isAnimating = false
  })
  state.hasTransitionEndListener = true
}

function getOriginalItems(state: CarouselState): HTMLElement[] {
  const originals = state.track.querySelectorAll('[data-copy="original"]')
  if (originals.length > 0) return Array.from(originals) as HTMLElement[]
  return Array.from(state.track.children) as HTMLElement[]
}

function getMinimumRowWidthPx(itemCount: number, minItemWidthPx: number, gapPx: number): number {
  if (itemCount <= 0) return 0
  return itemCount * minItemWidthPx + Math.max(0, itemCount - 1) * gapPx
}

function parseCssLengthToPx(rawValue: string, rootElement: HTMLElement | null): number {
  if (!rawValue) return NaN
  const numeric = Number(rawValue)
  if (Number.isFinite(numeric)) return numeric
  const trimmed = rawValue.trim().toLowerCase()
  if (trimmed.endsWith('px')) return Number.parseFloat(trimmed)
  if (trimmed.endsWith('rem')) {
    const rem = Number.parseFloat(trimmed)
    const rootFontSize =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    return rem * rootFontSize
  }
  if (trimmed.endsWith('%')) {
    const percent = Number.parseFloat(trimmed)
    const refWidth = rootElement?.getBoundingClientRect?.().width
    const resolvedRefWidth = typeof refWidth === 'number' ? refWidth : NaN
    if (!Number.isFinite(resolvedRefWidth) || resolvedRefWidth <= 0) return NaN
    return (percent / 100) * resolvedRefWidth
  }
  return NaN
}

function getMinCarouselItemWidthPx(state: CarouselState, originalItems: HTMLElement[]): number {
  const rawMin = getComputedStyle(state.track).getPropertyValue('--carousel-slide-min').trim()
  const parsed = parseCssLengthToPx(rawMin, state.viewport)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  const first = originalItems[0]
  return first ? first.getBoundingClientRect().width : 0
}

function isCarouselRequiredForState(state: CarouselState): boolean {
  /**
   * Prefer measuring real overflow in finite mode.
   *
   * Why:
   * - The "min width" calculation is great for stability (avoids hysteresis), but it can
   *   be wrong if CSS vars aren’t resolved as expected or if the first layout pass reports
   *   0 widths (common during initial render / font swap / async content).
   * - For finite carousels, `scrollWidth > clientWidth` is the most direct signal: if it
   *   overflows, we should activate and show nav buttons.
   *
   * Infinite mode:
   * - Once clones exist, scrollWidth is inflated. So for infinite (or when clones exist),
   *   we rely on the original-items "min width" computation.
   */
  const viewportWidth = state.viewport.getBoundingClientRect().width

  const originals = getOriginalItems(state)
  const gap = getGap(state)
  const minItemWidth = getMinCarouselItemWidthPx(state, originals)
  const minimumRequiredWidth = getMinimumRowWidthPx(originals.length, minItemWidth, gap)

  const epsilon = 1

  /**
   * Once infinite clones exist, scrollWidth is inflated and no longer reliable.
   * Before clones exist, scrollWidth/clientWidth is the most direct signal even in infinite mode.
   */
  if (state.hasInfiniteClones) {
    return minimumRequiredWidth > viewportWidth + epsilon
  }

  // Trust actual overflow first; fall back to min-width math.
  const hasActualOverflow = state.track.scrollWidth > state.viewport.clientWidth + epsilon
  return hasActualOverflow || minimumRequiredWidth > viewportWidth + epsilon
}

function beginCarouselResize(state: CarouselState): void {
  if (state.isResizing) return
  state.isResizing = true
  disableTrackTransition(state)
}

function scheduleCarouselResizeEnd(state: CarouselState): void {
  if (state.resizeTransitionRestoreTimeoutId) clearTimeout(state.resizeTransitionRestoreTimeoutId)
  state.resizeTransitionRestoreTimeoutId = setTimeout(() => {
    state.resizeTransitionRestoreTimeoutId = null
    endCarouselResize(state)
  }, 150)
}

function endCarouselResize(state: CarouselState): void {
  if (!state.isResizing) return
  state.isResizing = false
  restoreTrackTransition(state)
  if (state.isEnabled && !state.isInfinite) {
    getItems(state)
    state.currentItemIndex = Math.min(state.currentItemIndex, Math.max(0, state.totalItems - 1))
    moveNonInfiniteTrackToFocusedItem(state)
    setButtonStates(state)
  }
}

function scheduleCarouselReevaluation(state: CarouselState): void {
  if (state.pendingResizeFrameId != null) return
  state.pendingResizeFrameId = requestAnimationFrame(() => {
    state.pendingResizeFrameId = null
    reevaluateCarouselRequirement(state)
  })
}

function reevaluateCarouselRequirement(state: CarouselState): void {
  state.isInfinite = state.root.getAttribute('data-infinite') === 'true'
  syncAutoScrollConfigFromRoot(state)
  const shouldEnable = isCarouselRequiredForState(state)

  /**
   * Ensure nav visibility always matches the decision.
   *
   * This makes the UI resilient even if CSS is cached, overridden, or reordered:
   * - When carousel is not required, nav buttons must be hidden.
   * - When carousel is required, nav buttons can be shown.
   *
   * CSS still styles/positions the nav; this is purely a display toggle.
   */
  if (state.navButtons) {
    state.navButtons.style.display = shouldEnable ? 'flex' : 'none'
  }

  // Auto-scroll should only run when the carousel is enabled.
  if (!shouldEnable) {
    stopAutoScroll(state)
  }

  /**
   * Debug instrumentation (DOM-visible, no console noise).
   *
   * These attributes make it easy to inspect why a carousel is (not) activating:
   * - `data-carousel-initialized="true"` confirms JS ran
   * - `data-carousel-debug-*` exposes measured geometry + decision
   *
   * Safe to keep in production (small strings), but can be removed once stable.
   */
  state.root.setAttribute('data-carousel-initialized', 'true')
  state.root.setAttribute('data-carousel-debug-enabled', shouldEnable ? 'true' : 'false')
  state.root.setAttribute('data-carousel-debug-infinite', state.isInfinite ? 'true' : 'false')
  state.root.setAttribute('data-carousel-debug-has-clones', state.hasInfiniteClones ? 'true' : 'false')
  state.root.setAttribute('data-carousel-debug-viewport', String(Math.round(state.viewport.clientWidth)))
  state.root.setAttribute('data-carousel-debug-track', String(Math.round(state.track.scrollWidth)))

  if (shouldEnable && !state.isEnabled) {
    enableCarousel(state)
    getItems(state)
    if (state.isInfinite) {
      ensureTransitionEndListener(state)
      initInfiniteCarousel(state)
      ensureAutoScrollHoverListeners(state)
      scheduleAutoScrollTick(state)
      return
    }
    state.currentItemIndex = Math.min(state.currentItemIndex, Math.max(0, state.totalItems - 1))
    moveNonInfiniteTrackToFocusedItem(state)
    setButtonStates(state)
    ensureAutoScrollHoverListeners(state)
    scheduleAutoScrollTick(state)
    return
  }

  if (!shouldEnable && state.isEnabled) {
    disableCarousel(state)
    stopAutoScroll(state)
    return
  }

  if (shouldEnable && state.isEnabled) {
    if (state.isInfinite) {
      ensureTransitionEndListener(state)
      if (!state.hasInfiniteClones) initInfiniteCarousel(state)
      ensureAutoScrollHoverListeners(state)
      scheduleAutoScrollTick(state)
      return
    }
    getItems(state)
    state.currentItemIndex = Math.min(state.currentItemIndex, Math.max(0, state.totalItems - 1))
    moveNonInfiniteTrackToFocusedItem(state)
    setButtonStates(state)
    ensureAutoScrollHoverListeners(state)
    scheduleAutoScrollTick(state)
  }
}

function observeCarouselResize(state: CarouselState): void {
  if (state.resizeObserver) return
  state.resizeObserver = new ResizeObserver(() => {
    beginCarouselResize(state)
    scheduleCarouselResizeEnd(state)
    scheduleCarouselReevaluation(state)
  })
  /**
   * Observe both the viewport and the track.
   *
   * Why:
   * - In the original demo, card widths were effectively stable (CSS clamp + fixed structure).
   * - In the app, slide content (fonts, async hydration, images) can change the track's
   *   scrollWidth without changing the viewport's clientWidth.
   * - If we only observe the viewport, we can miss the moment the content starts overflowing,
   *   so `data-carousel-active="true"` is never set and the nav buttons never appear.
   */
  state.resizeObserver.observe(state.viewport)
  state.resizeObserver.observe(state.track)
}

/**
 * Re-evaluates when track children are added or removed so carousel
 * enables/disables and recalculates bounds without a viewport resize.
 */
function observeCarouselTrackChildren(state: CarouselState): void {
  if (state.mutationObserver) return
  state.mutationObserver = new MutationObserver(() => {
    scheduleCarouselReevaluation(state)
  })
  state.mutationObserver.observe(state.track, { childList: true, subtree: false })
}

/**
 * Initialises the responsive carousel on the given root element.
 * Root must contain elements with data-carousel-viewport, data-carousel-track,
 * data-carousel-prev, and data-carousel-next. Use data-infinite="true" for
 * infinite scrolling.
 */
export function initResponsiveCarousel(root: HTMLElement): void {
  let state = getState(root)
  if (!state) state = createState(root)
  try {
    root.setAttribute('data-carousel-initialized', 'true')
    state.isInfinite = root.getAttribute('data-infinite') === 'true'
    ensureCarouselEventListeners(state)
    ensureCarouselSwipeListeners(state)
    observeCarouselResize(state)
    observeCarouselTrackChildren(state)
    reevaluateCarouselRequirement(state)

    /**
     * Re-check after the first paint.
     *
     * In React/Next, the first evaluation can run before layout stabilizes (fonts, hydration,
     * async content). Scheduling a second evaluation ensures scrollWidth/clientWidth reflect
     * the real rendered geometry so `data-carousel-active="true"` is applied when needed.
     */
    requestAnimationFrame(() => {
      reevaluateCarouselRequirement(state)
    })
  } catch (error) {
    // Surface init failures in the DOM so they are visible in DevTools.
    root.setAttribute('data-carousel-error', 'true')
    root.setAttribute(
      'data-carousel-error-message',
      error instanceof Error ? error.message : 'Unknown carousel init error'
    )
  }
}

/**
 * Tears down the carousel: disconnects ResizeObserver and clears stored state.
 * Call when the carousel root is unmounted (e.g. in a React useEffect cleanup).
 */
export function destroyResponsiveCarousel(root: HTMLElement): void {
  const state = getState(root)
  if (!state) return
  stopAutoScroll(state)
  if (state.hasAutoScrollHoverListeners) {
    if (state.onAutoScrollMouseEnter) {
      state.viewport.removeEventListener('mouseenter', state.onAutoScrollMouseEnter)
    }
    if (state.onAutoScrollMouseLeave) {
      state.viewport.removeEventListener('mouseleave', state.onAutoScrollMouseLeave)
    }
  }
  if (state.resizeObserver) {
    state.resizeObserver.disconnect()
    state.resizeObserver = null
  }
  if (state.mutationObserver) {
    state.mutationObserver.disconnect()
    state.mutationObserver = null
  }
  if (state.resizeTransitionRestoreTimeoutId != null) {
    clearTimeout(state.resizeTransitionRestoreTimeoutId)
    state.resizeTransitionRestoreTimeoutId = null
  }
  if (state.pendingResizeFrameId != null) {
    cancelAnimationFrame(state.pendingResizeFrameId)
    state.pendingResizeFrameId = null
  }
  stateByRoot.delete(root)
}
