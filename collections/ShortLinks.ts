import type { CollectionConfig } from "payload"

/**
 * Short links map a short code (e.g. used in /s/abc12xyz) to a target path
 * (e.g. /blog/my-post-slug). Used for shareable short URLs that redirect to
 * the canonical blog post or other content.
 *
 * Documents are created on-demand by the short-url API when a user first
 * requests a short link for a given path. The admin UI allows viewing and
 * optional manual management.
 */
export const ShortLinks: CollectionConfig = {
  slug: "short-links",
  admin: {
    useAsTitle: "shortCode",
    defaultColumns: ["shortCode", "targetPath", "label", "createdAt"],
    description:
      "Short URLs (e.g. /s/xyz) that redirect to full paths. Created automatically when blog posts are shared.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "shortCode",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "URL-safe code used in the short link path (e.g. /s/<shortCode>). Generated automatically by the API.",
      },
    },
    {
      name: "targetPath",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Destination path on this site (e.g. /blog/my-post-slug). Redirects go to siteUrl + targetPath.",
      },
    },
    {
      name: "label",
      type: "text",
      admin: {
        description: "Optional label for admin display (e.g. post title). Not used in redirects.",
      },
    },
  ],
}
