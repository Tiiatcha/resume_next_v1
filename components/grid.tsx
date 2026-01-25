import ElementProps from "@/interfaces/element-props";
import { cn } from "@/lib/utils";

interface GridProps extends ElementProps {
  variant?: "default" | "two";
  children: React.ReactNode;
}

function Grid({
  children,
  className,
  variant = "default",
  ...props
}: GridProps): React.JSX.Element {
  const variants = {
    default: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    two: "grid grid-cols-2 gap-4",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
interface SubGridProps extends ElementProps {
  variant?: "default";
  children: React.ReactNode;
}
function SubGrid({
  children,
  className,
  variant = "default",
  ...props
}: SubGridProps): React.JSX.Element {
  const variants = {
    /**
     * Uses CSS Subgrid.
     *
     * Notes:
     * - Subgrid only takes effect when the parent establishes explicit tracks.
     * - We default to inheriting rows and columns when available.
     */
    default: "grid grid-rows-subgrid grid-cols-subgrid",
  };
  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface CardContainerProps extends ElementProps {
  /**
   * Child should typically span all 4 rows (e.g. via `row-span-4`).
   *
   * This provides a consistent track structure so internal card content can
   * align using CSS Subgrid (`grid-rows-subgrid`).
   */
  children: React.ReactNode;
}

/**
 * Establishes a 4-row grid for consistent card alignment.
 *
 * Intended usage:
 * - `CardContainer` defines the rows (`grid-rows-4`)
 * - `Reveal` + card use `grid-rows-subgrid row-span-4` to align to those rows.
 */
function CardContainer({
  children,
  className,
  ...props
}: CardContainerProps): React.JSX.Element {
  return (
    <div
      className={cn(
        // 4 rows:
        // - Rows 1–3: auto height (content-driven)
        // - Row 4: 1fr (fills remaining height within the card)
        //
        // This is the critical track definition that `grid-rows-subgrid` inherits.
        "grid grid-rows-[auto_auto_auto_1fr]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSubgridProps extends ElementProps {
  children: React.ReactNode;
}

/**
 * Utility wrapper for a 4-row subgrid child.
 *
 * Use inside `CardContainer` (or any parent with explicit rows) so the child
 * aligns to the parent’s 4-row track definition.
 */
function CardSubgrid({
  children,
  className,
  ...props
}: CardSubgridProps): React.JSX.Element {
  return (
    <div className={cn("grid grid-rows-subgrid row-span-4", className)} {...props}>
      {children}
    </div>
  );
}

export { Grid, SubGrid, CardContainer, CardSubgrid };
