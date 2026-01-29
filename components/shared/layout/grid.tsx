import type ElementProps from "@/interfaces/element-props"
import { cn } from "@/lib/utils"

interface GridProps extends ElementProps {
  variant?: "default" | "two"
  children: React.ReactNode
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
  }

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

interface SubGridProps extends ElementProps {
  children: React.ReactNode
}

function SubGrid({ children, className, ...props }: SubGridProps): React.JSX.Element {
  return (
    <div className={cn("grid grid-rows-subgrid grid-cols-subgrid", className)} {...props}>
      {children}
    </div>
  )
}

interface CardContainerProps extends ElementProps {
  children: React.ReactNode
}

function CardContainer({
  children,
  className,
  ...props
}: CardContainerProps): React.JSX.Element {
  return (
    <div className={cn("grid grid-rows-[auto_auto_auto_1fr]", className)} {...props}>
      {children}
    </div>
  )
}

interface CardSubgridProps extends ElementProps {
  children: React.ReactNode
}

function CardSubgrid({
  children,
  className,
  ...props
}: CardSubgridProps): React.JSX.Element {
  return (
    <div className={cn("grid grid-rows-subgrid row-span-4", className)} {...props}>
      {children}
    </div>
  )
}

export { Grid, SubGrid, CardContainer, CardSubgrid }

