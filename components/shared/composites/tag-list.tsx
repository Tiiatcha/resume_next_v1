import type { TagProps } from "@/components/shared/primitives/tag"
import { Tag } from "@/components/shared/primitives/tag"

export function TagList({
  tags,
  variant = "violet",
  className,
}: {
  tags: string[]
  variant?: TagProps["variant"]
  className?: string
}) {
  if (tags.length === 0) return null

  return (
    <ul className={className ?? "flex flex-wrap gap-2"}>
      {tags.map((tag) => (
        <li key={tag}>
          <Tag variant={variant}>{tag}</Tag>
        </li>
      ))}
    </ul>
  )
}

