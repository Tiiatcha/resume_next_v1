import type { CollectionConfig } from "payload"

/**
 * Tag taxonomy for content classification across multiple collections.
 *
 * Why this is a Collection (not inline text arrays):
 * - Tags are centrally managed in the admin UI without code changes.
 * - Relationship fields enforce consistency (no typos/variants like "Next.js" vs "NextJS").
 * - Enables better filtering, autocomplete, and analytics across all tagged content.
 * - Can be scoped to specific collections to keep tag pickers relevant.
 */
export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "scopes", "updatedAt"],
    description:
      "Reusable tags for blog posts, experiences, and other content. Tags can be scoped to specific collections.",
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
          "Tag label shown on the site (e.g. TypeScript, React, Leadership). Keep it consistent and canonical.",
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
          "Used for filtering and URLs. Auto-generated from the name, but you can edit it.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const explicitSlug = typeof value === "string" ? value.trim() : ""
            if (explicitSlug) return explicitSlug

            const name = typeof data?.name === "string" ? data.name : ""
            const generated = createUrlSlug(name)
            return generated || "tag"
          },
        ],
      },
    },
    {
      name: "scopes",
      label: "Applies to",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["blog-posts", "experiences"],
      options: [
        { label: "Blog posts", value: "blog-posts" },
        { label: "Experiences", value: "experiences" },
        { label: "Changelog entries", value: "changelog-entries" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Controls where this tag can be selected. Each collection filters the tag picker to only show relevant tags. Select all that apply.",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional context about when to use this tag (helpful for content authors).",
      },
    },
    {
      name: "color",
      type: "relationship",
      relationTo: "tag-colors",
      admin: {
        position: "sidebar",
        description:
          "Optional color scheme for this tag. The selected color's Tailwind classes will be applied when rendering this tag in the UI.",
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
