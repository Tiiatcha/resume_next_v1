import type { CollectionConfig } from "payload"

/**
 * Blog category taxonomy.
 *
 * Why this is a Collection (not a Select field):
 * - Categories can be created/renamed in the admin UI without code changes.
 * - A relationship field on `blog-posts` enforces consistency (no typos/variants).
 * - The slug gives us a stable filtering key (e.g. `?category=engineering`).
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "updatedAt"],
    description:
      "Categories can be scoped to specific collections (e.g. Blog posts now, other content types later).",
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
      admin: {
        description: "Human-friendly label shown on the site (e.g. Engineering).",
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
            return generated || "category"
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
      defaultValue: ["blog-posts"],
      options: [
        { label: "Blog posts", value: "blog-posts" },
        { label: "Changelog entries", value: "changelog-entries" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Controls where this category can be selected. Each collection filters the category picker to only show relevant categories.",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional summary shown in admin and can be used for SEO/UX later.",
      },
    },
  ],
}

function createUrlSlug(input: string): string {
  // Create a stable, URL-friendly slug:
  // - lower-case
  // - replace non-alphanumeric sequences with "-"
  // - trim leading/trailing hyphens
  // - collapse repeated hyphens
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

