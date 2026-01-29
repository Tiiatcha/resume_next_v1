import type { CollectionConfig } from "payload"

/**
 * Tag categories for grouping and coloring tags.
 *
 * Purpose:
 * - Group related tags together (e.g., "Technology", "Soft Skills", "Tools")
 * - Apply consistent colors to all tags in a category
 * - Provide semantic organization for tag management
 *
 * Example categories:
 * - Technology → Sky blue (frameworks, languages)
 * - Soft Skills → Pink (leadership, communication)
 * - Tools → Violet (software, platforms)
 * - Business → Emerald (achievements, metrics)
 */
export const TagCategories: CollectionConfig = {
  slug: "tag-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "color", "updatedAt"],
    description:
      "Categories for organizing tags. Each category has a color that applies to all its tags.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Category name (e.g. Technology, Soft Skills, Tools). All tags in this category will share the same color.",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description:
          "Used programmatically for filtering. Auto-generated from the name.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const explicitSlug = typeof value === "string" ? value.trim() : ""
            if (explicitSlug) return explicitSlug

            const name = typeof data?.name === "string" ? data.name : ""
            const generated = createUrlSlug(name)
            return generated || "category"
          },
        ],
      },
    },
    {
      name: "color",
      type: "relationship",
      relationTo: "tag-colors",
      required: true,
      admin: {
        position: "sidebar",
        description:
          "Color scheme for all tags in this category. Choose from the predefined color palette.",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional description of when to use this category (e.g. 'Use for programming languages and frameworks').",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description:
          "Controls display order in admin UI (lower numbers appear first).",
      },
    },
  ],
}

/**
 * Creates a URL-friendly slug from input text.
 *
 * Process:
 * 1. Normalize to lowercase
 * 2. Remove diacritics (é → e)
 * 3. Replace non-alphanumeric sequences with hyphens
 * 4. Collapse repeated hyphens
 * 5. Trim leading/trailing hyphens
 */
function createUrlSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}
