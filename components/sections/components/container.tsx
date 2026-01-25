import * as React from "react";
import { cn } from "@/lib/utils";
import type ElementProps from "@/interfaces/element-props";

type ContainerVariant = "default" | "left";

interface ContainerProps extends Omit<ElementProps<HTMLDivElement>, "variant"> {
  /**
   * Alignment preset for section containers.
   *
   * - `default`: centered content (good for most sections).
   * - `left`: left-aligned content (good for editorial/reading layouts).
   */
  variant?: ContainerVariant;
}

function Container({
  children,
  className,
  variant = "default",
  ...props
}: ContainerProps): React.JSX.Element {
  const baseClasses = "w-full max-w-6xl gap-6";
  const variants: Record<ContainerVariant, string> = {
    default:
      (cn(baseClasses, "container flex flex-col items-center justify-center")),
    left: (cn(baseClasses, "container flex flex-col items-start")),
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface ContainerIntroProps extends ElementProps {
  variant?: ContainerVariant;
}

function ContainerIntro({
  children,
  className,
  variant = "default",
  ...props
}: ContainerIntroProps): React.JSX.Element {
  const variants: Record<ContainerVariant, string> = {
    default:
      "container-intro text-center flex flex-col items-center justify-center gap-4",
    left: "container-intro text-left flex flex-col items-start justify-center gap-4",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface ContainerTitleProps extends ElementProps {
  variant?: ContainerVariant;
}

function ContainerTitle({
  children,
  className,
  variant = "default",
  ...props
}: ContainerTitleProps): React.JSX.Element {
  const baseClasses =
    "container-title text-2xl font-semibold leading-tight tracking-tight";
  const variants: Record<ContainerVariant, string> = {
    default: `${baseClasses} text-center`,
    left: `${baseClasses} text-left`,
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface ContainerEyebrowProps extends ElementProps {
  variant?: ContainerVariant;
}

function ContainerEyebrow({
  children,
  className,
  variant = "default",
  ...props
}: ContainerEyebrowProps): React.JSX.Element {
  const variants: Record<ContainerVariant, string> = {
    default: "container-eyebrow text-sm text-muted-foreground",
    left: "container-eyebrow text-left text-sm text-muted-foreground",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface ContainerLeadProps extends ElementProps {
  variant?: ContainerVariant;
}

function ContainerLead({
  children,
  className,
  variant = "default",
  ...props
}: ContainerLeadProps): React.JSX.Element {
  const baseClasses = "container-lead text-muted-foreground text-m";
  const variants: Record<ContainerVariant, string> = {
    default: `${baseClasses} text-center`,
    left: `${baseClasses} text-left`,
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface ContainerContentProps extends ElementProps {
  variant?: ContainerVariant;
}

function ContainerContent({
  children,
  className,
  variant = "default",
  ...props
}: ContainerContentProps): React.JSX.Element {
  const baseClasses =
    "container-content flex flex-col items-center justify-center gap-4";
  const variants: Record<ContainerVariant, string> = {
    default: `${baseClasses} text-center`,
    left: `${baseClasses} text-left`,
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export {
  Container,
  ContainerIntro,
  ContainerTitle,
  ContainerEyebrow,
  ContainerLead,
  ContainerContent,
};
