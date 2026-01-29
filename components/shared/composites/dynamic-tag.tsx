import * as React from "react"
import { Tag, type TagProps } from "@/components/shared/primitives/tag"
import { cn } from "@/lib/utils"

/**
 * Type definition for a tag color from Payload.
 */
interface TagColor {
  id: string
  name: string
  slug: string
  tailwindClasses: string
}

/**
 * Type definition for a tag category with its color populated.
 */
interface TagCategory {
  id: string
  name: string
  slug: string
  color: TagColor | string
}

/**
 * Type definition for a tag with its category and color relationships populated.
 *
 * This matches the shape of tags fetched from Payload when relationships
 * are populated with `depth: 2` or higher.
 */
export interface TagWithCategory {
  id: string
  name: string
  slug: string
  category?: TagCategory | string | null
}

interface DynamicTagProps extends Omit<TagProps, "variant"> {
  /**
   * Tag data from Payload, with the category relationship optionally populated.
   * Can be a string (tag name) or a full tag object.
   */
  tag: TagWithCategory | string
  /**
   * Fallback variant to use if no category color is defined.
   * @default "violet"
   */
  fallbackVariant?: TagProps["variant"]
}

/**
 * Extracts the Tailwind classes from a tag's category color.
 *
 * @param tag - The tag object with potentially populated relationships
 * @returns Tailwind class string or null if not found
 */
function getTagColorClasses(tag: TagWithCategory): string | null {
  if (!tag.category || typeof tag.category === "string") {
    return null
  }

  const { color } = tag.category
  if (!color || typeof color === "string") {
    return null
  }

  return color.tailwindClasses || null
}

/**
 * DynamicTag component renders a tag with colors from its Payload category.
 *
 * Color resolution order:
 * 1. tag.category.color.tailwindClasses (if populated)
 * 2. fallbackVariant prop (if provided)
 * 3. "violet" (default)
 *
 * Usage:
 * ```tsx
 * // With populated category and color relationships
 * <DynamicTag tag={tag} />
 *
 * // With string tag (will use fallback)
 * <DynamicTag tag="TypeScript" fallbackVariant="sky" />
 *
 * // With custom fallback
 * <DynamicTag tag={tag} fallbackVariant="emerald" />
 * ```
 *
 * When fetching tags from Payload, use `depth: 2` to populate relationships:
 * ```ts
 * const experience = await payload.findByID({
 *   collection: 'experiences',
 *   id: '...',
 *   depth: 2, // Populates tags → category → color
 * })
 * ```
 */
export function DynamicTag({
  tag,
  fallbackVariant = "violet",
  className,
  ...props
}: DynamicTagProps) {
  // Handle string tags (simple case)
  if (typeof tag === "string") {
    return (
      <Tag variant={fallbackVariant} className={className} {...props}>
        {tag}
      </Tag>
    )
  }

  // Extract tag name and color classes
  const tagName = tag.name
  const colorClasses = getTagColorClasses(tag)

  // If we have custom color classes from Payload, use them
  if (colorClasses) {
    return (
      <span className={cn(colorClasses, className)} {...props}>
        {tagName}
      </span>
    )
  }

  // Otherwise, fall back to the variant system
  return (
    <Tag variant={fallbackVariant} className={className} {...props}>
      {tagName}
    </Tag>
  )
}
