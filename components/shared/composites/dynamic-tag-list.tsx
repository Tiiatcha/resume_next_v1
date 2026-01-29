import { DynamicTag, type TagWithCategory } from "@/components/shared/composites/dynamic-tag"
import type { TagProps } from "@/components/shared/primitives/tag"
import { cn } from "@/lib/utils"

/**
 * DynamicTagList component for rendering a list of tags with category-based colors.
 *
 * This component handles both string tags and full tag objects from Payload.
 * When tag objects are provided with populated category relationships,
 * each tag will be colored according to its category.
 *
 * @param tags - Array of tag strings or tag objects with populated relationships
 * @param fallbackVariant - Color variant to use when a tag has no category color
 * @param className - Optional className for the list container
 *
 * Example usage:
 * ```tsx
 * // With Payload tag objects (each can have different colors based on category)
 * <DynamicTagList tags={experience.tags} fallbackVariant="violet" />
 *
 * // With string tags (all use fallback color)
 * <DynamicTagList tags={["TypeScript", "React"]} fallbackVariant="sky" />
 *
 * // Mixed (will handle both)
 * <DynamicTagList tags={mixedTags} />
 * ```
 *
 * When fetching from Payload, use `depth: 2`:
 * ```ts
 * const experience = await payload.findByID({
 *   collection: 'experiences',
 *   id: '...',
 *   depth: 2, // Populates tags → category → color
 * })
 * ```
 */
export function DynamicTagList({
  tags,
  fallbackVariant = "violet",
  className,
}: {
  tags: (TagWithCategory | string)[]
  fallbackVariant?: TagProps["variant"]
  className?: string
}) {
  if (!tags || tags.length === 0) return null

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, index) => {
        // Generate a stable key
        const key = typeof tag === "string" ? tag : tag.id || tag.slug || index

        return (
          <li key={key}>
            <DynamicTag tag={tag} fallbackVariant={fallbackVariant} />
          </li>
        )
      })}
    </ul>
  )
}
