import type { CollectionConfig } from "payload"

/**
 * Color definitions for tags with their corresponding Tailwind classes.
 *
 * Why this is a Collection:
 * - Colors are centrally managed through the Payload admin UI
 * - Designers/content authors can add new color variants without code changes
 * - Ensures consistent styling across all tagged content
 * - The Tailwind classes are defined once and reused everywhere
 *
 * Pattern used (matching your existing badge/tag styles):
 * - Light mode: semi-transparent background with solid text
 * - Dark mode: same background opacity with lighter text
 * - Subtle ring/border for definition
 * - Optional hover states for interactive elements
 */
export const TagColors: CollectionConfig = {
  slug: "tag-colors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "previewSwatch", "updatedAt"],
    description:
      "Define color schemes for tags. Each color includes all required Tailwind classes for consistent styling across light and dark modes.",
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
          "Descriptive name for this color scheme (e.g. Violet, Emerald, Sky).",
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
          "Used programmatically to reference this color. Auto-generated from the name.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const explicitSlug = typeof value === "string" ? value.trim() : ""
            if (explicitSlug) return explicitSlug

            const name = typeof data?.name === "string" ? data.name : ""
            const generated = createUrlSlug(name)
            return generated || "color"
          },
        ],
      },
    },
    {
      name: "tailwindClasses",
      label: "Tailwind classes",
      type: "text",
      required: true,
      admin: {
        description:
          'Complete Tailwind class string for this color (e.g. "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/25 hover:bg-violet-500/15 dark:text-violet-300"). Include light mode, dark mode, and hover states.',
        placeholder:
          "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/25 hover:bg-violet-500/15 dark:text-violet-300",
      },
    },
    {
      name: "previewSwatch",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          'Tailwind background color for preview (e.g. "bg-violet-500"). Used for visual reference in the admin UI.',
        placeholder: "bg-violet-500",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional usage guidance (e.g. 'Use for technology/framework tags', 'Use for soft skills').",
      },
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Clean up any TagCategories that reference this color before deletion.
        // This prevents referential integrity issues that would cause "unknown error" in the admin UI.
        try {
          const categories = await req.payload.find({
            collection: "tag-categories",
            where: {
              color: {
                equals: id,
              },
            },
            limit: 100, // Process in batches if there are many
          })

          // For each category referencing this color, we need to either:
          // 1. Set their color to null (if we make the field optional), or
          // 2. Prevent deletion by throwing an error
          // Since the color field is REQUIRED, we must prevent deletion if categories reference it.
          if (categories.docs.length > 0) {
            const categoryNames = categories.docs
              .map((cat) => (typeof cat === "object" && "name" in cat ? cat.name : "Unknown"))
              .filter(Boolean)
              .join(", ")

            throw new Error(
              `Cannot delete this color because it is used by ${categories.docs.length} tag ${
                categories.docs.length === 1 ? "category" : "categories"
              }: ${categoryNames}. Please reassign ${
                categories.docs.length === 1 ? "this category" : "these categories"
              } to a different color first.`,
            )
          }
        } catch (error) {
          // If it's our intentional error, re-throw it
          if (error instanceof Error && error.message.includes("Cannot delete this color")) {
            throw error
          }

          // Otherwise, log and allow deletion to proceed
          req.payload.logger.error(
            `Failed to check tag categories for color ${id}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      },
    ],
  },
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
