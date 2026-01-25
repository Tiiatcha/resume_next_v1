import { Tag } from "@/components/primitives/tag"

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Tag>{tag}</Tag>
        </li>
      ))}
    </ul>
  )
}

