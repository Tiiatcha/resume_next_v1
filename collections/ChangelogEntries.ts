import type { CollectionConfig } from "payload"

/**
 * Public changelog entries.
 *
 * Intent:
 * - Provide short, structured "what changed" entries (Added/Changed/Fixed/etc.)
 * - Keep entries linkable via stable URLs (`/changelog/:slug`)
 * - Support an editorial workflow (draft vs published)
 *
 * Important semantics:
 * - `publishedAt` represents the **date of the change** (when it shipped), not the timestamp
 *   when the entry was marked as `published` in the CMS.
 */
export const ChangelogEntries: CollectionConfig = {
  slug: "changelog-entries",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "version", "status", "publishedAt", "updatedAt"],
    description:
      "Changelog entries are short, structured release notes. Use the blog for deep dives and longer write-ups.",
  },
  access: {
    read: ({ req }) => {
      // Anonymous visitors can read published entries only.
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
      admin: {
        description:
          "Human-friendly summary (e.g. “Projects section now CMS-backed”).",
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
          "Used in the URL. Auto-generated from the title, but you can edit it.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const explicitSlug = typeof value === "string" ? value.trim() : ""
            if (explicitSlug) return explicitSlug

            const title = typeof data?.title === "string" ? data.title : ""
            const generated = createUrlSlug(title)
            return generated || "change"
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
      required: true,
      admin: {
        position: "sidebar",
        description:
          "Date the change shipped (not the date you clicked Publish). You can backdate this.",
      },
    },
    {
      name: "version",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "Optional version label (e.g. v1.3.0). Useful if you start tagging releases.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: {
        description:
          "1–2 sentence overview shown on the changelog listing page.",
      },
    },
    {
      name: "changes",
      type: "array",
      required: true,
      minRows: 1,
      admin: {
        description:
          "The structured change list. Keep each item short and user-facing.",
      },
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "Added", value: "added" },
            { label: "Changed", value: "changed" },
            { label: "Fixed", value: "fixed" },
            { label: "Removed", value: "removed" },
            { label: "Security", value: "security" },
          ],
        },
        {
          name: "text",
          type: "text",
          required: true,
        },
        {
          name: "linkKind",
          label: "Link type",
          type: "select",
          required: true,
          defaultValue: "none",
          options: [
            { label: "No link", value: "none" },
            { label: "External URL", value: "external" },
            { label: "Internal content", value: "internal" },
          ],
          admin: {
            description:
              "Optional link for extra context. Internal links should be used for your own content (e.g. a deep-dive blog post).",
          },
        },
        {
          name: "externalUrl",
          label: "External URL",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData?.linkKind === "external",
            description: "Full URL (e.g. https://example.com).",
          },
        },
        {
          name: "internalCollection",
          label: "Internal collection",
          type: "select",
          admin: {
            condition: (_, siblingData) => siblingData?.linkKind === "internal",
            description:
              "Choose which internal content to link to. Add more options as new content types ship.",
          },
          options: [{ label: "Blog posts", value: "blog-posts" }],
        },
        {
          name: "internalBlogPost",
          label: "Blog post",
          type: "relationship",
          relationTo: "blog-posts",
          admin: {
            condition: (_, siblingData) =>
              siblingData?.linkKind === "internal" &&
              siblingData?.internalCollection === "blog-posts",
            description: "Select the blog post to link to.",
          },
        },
      ],
    },
    {
      name: "relatedPost",
      type: "relationship",
      relationTo: "blog-posts",
      admin: {
        position: "sidebar",
        description:
          "Optional deep dive blog post that explains this change in more detail.",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // `publishedAt` is the *change date*.
        // If editors don't set it explicitly, default to "today" at time of save.
        if (!data?.publishedAt) {
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

