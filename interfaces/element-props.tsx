import type { HTMLAttributes, ReactNode } from "react";

/**
 * Base props interface for layout components.
 * Provides common HTML attributes, children, and className.
 * Variants are component-specific so should be defined using the component's props.
 *
 * Make the element type configurable so shared layout components can safely render
 * non-`div` elements (e.g. `ul`, `li`, `section`) while keeping correct event handler types.
 *
 * @template TElement - The HTML element type (defaults to HTMLDivElement for backward compatibility)
 */
export default interface ElementProps<
  TElement extends HTMLElement = HTMLDivElement
> extends HTMLAttributes<TElement> {
  children: ReactNode;
  className?: string;
  variant?: string;
}
