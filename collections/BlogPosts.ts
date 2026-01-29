import type { CollectionConfig } from "payload"

/**
 * Public blog posts.
 *
 * Key design goals:
 * - **Editorial workflow**: draft vs published, and published timestamps
 * - **Stable URLs**: generated slug (editable) with uniqueness enforcement
 * - **Rich content**: Lexical rich text (configured globally in `payload.config.ts`)
 * - **Public by default**: anonymous users only see published posts
 */
export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "updatedAt"],
    description:
      "Blog posts support drafts, published dates, and Lexical rich text content.",
  },
  access: {
    read: ({ req }) => {
      // Anonymous visitors can read published posts only.
      // Authenticated users (admin/editor) can read everything for previews.
      if (req.user) return true
      return {
        status: {
          equals: "published",
        },
      }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
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
          "Used in the URL. Auto-generated from the title, but you can edit it.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const explicitSlug = typeof value === "string" ? value.trim() : ""
            if (explicitSlug) return explicitSlug

            const title = typeof data?.title === "string" ? data.title : ""
            const generated = createUrlSlug(title)
            return generated || "post"
          },
        ],
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description:
          "Set automatically when a post is first published (you can override).",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: {
        description:
          "Short summary used on the blog listing page and in metadata.",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      filterOptions: {
        // Only show categories that explicitly apply to blog posts.
        // This keeps the picker clean if other collections start using categories later.
        scopes: { contains: "blog-posts" },
      },
      admin: {
        position: "sidebar",
        description:
          "Optional category used for filtering (e.g. Engineering, Deep dives).",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      admin: {
        description:
          "Main post content (Lexical rich text). Use headings, links, and lists.",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "imageAttribution",
      label: "Image attribution",
      type: "group",
      admin: {
        position: "sidebar",
        description:
          "Optional credit line for stock/third-party images (e.g. Unsplash). If any field is filled, we’ll render a subtle “Photo by … on …” caption on the post.",
      },
      fields: [
        {
          name: "platformName",
          label: "Platform name",
          type: "text",
          admin: {
            placeholder: "Unsplash",
          },
        },
        {
          name: "platformUrl",
          label: "Platform URL",
          type: "text",
          admin: {
            placeholder: "https://unsplash.com",
            description:
              "Link to the platform (or the platform’s credit URL if required).",
          },
        },
        {
          name: "artistName",
          label: "Artist name",
          type: "text",
          admin: {
            placeholder: "Glenn Carstens-Peters",
          },
        },
        {
          name: "artistUrl",
          label: "Artist URL",
          type: "text",
          admin: {
            placeholder: "https://unsplash.com/@glenncarstenspeters",
            description: "Link to the artist/photographer profile page.",
          },
        },
        {
          name: "imageUrl",
          label: "Image URL",
          type: "text",
          admin: {
            placeholder: "https://unsplash.com/photos/npxXWgQ33ZQ",
            description:
              "Link to the original image page (often required for attribution).",
          },
        },
      ],
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      filterOptions: {
        // Only show tags that explicitly apply to blog posts.
        // This keeps the picker clean and relevant.
        scopes: { contains: "blog-posts" },
      },
      admin: {
        position: "sidebar",
        description:
          "Optional tags for filtering and discovery (e.g. Next.js, Payload, TypeScript). Select from the centralized tags collection.",
      },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          ({ value, req }) => {
            // If an authenticated user is creating a post and author is not set,
            // default the author to the current user.
            if (value) return value
            return req.user?.id ?? value
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // When a post is marked as published, ensure it has a published timestamp.
        if (data?.status === "published" && !data?.publishedAt) {
          return { ...data, publishedAt: new Date().toISOString() }
        }
        return data
      },
    ],
  },
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

