import type { GlobalConfig } from "payload"

/**
 * Site-wide settings used as the default SEO baseline across the public site.
 *
 * Why this is a Global (not a Collection):
 * - There is one canonical set of defaults for the whole site (title template, description, share image).
 * - Most pages should inherit these defaults and only override what is unique per-page.
 * - Editors should be able to update SEO defaults without code changes.
 *
 * How it is used:
 * - `app/(app)/layout.tsx` reads this Global and returns Next.js `generateMetadata()`
 *   so all routes inherit these defaults unless they explicitly override metadata.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    description:
      "Default SEO and social sharing metadata for the site. Individual pages can override these values in code when needed.",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "SEO defaults",
          fields: [
            {
              name: "siteName",
              label: "Site name",
              type: "text",
              required: true,
              defaultValue: "Craig Davison",
              admin: {
                description:
                  "Used as the Open Graph site name and as part of the title template.",
              },
            },
            {
              name: "siteUrl",
              label: "Site URL",
              type: "text",
              required: true,
              defaultValue: "https://craigdavison.com",
              admin: {
                description:
                  "The canonical public base URL (used for canonical URLs and absolute OG image URLs). Include https://",
              },
            },
            {
              name: "defaultTitle",
              label: "Default page title",
              type: "text",
              required: true,
              defaultValue: "Craig Davison — CV",
              admin: {
                description:
                  "Used for pages that do not define a specific title (e.g. the homepage).",
              },
            },
            {
              name: "titleTemplate",
              label: "Title template",
              type: "text",
              required: true,
              defaultValue: "%s — Craig Davison",
              admin: {
                description:
                  "Used when a page defines a specific title. Keep `%s` as the placeholder for the page title.",
              },
            },
            {
              name: "defaultDescription",
              label: "Default description",
              type: "textarea",
              required: true,
              defaultValue:
                "Technology professional transitioning into modern web development. Experience in SAP HANA/BW, JavaScript/Node.js/React, and delivery-focused leadership.",
              admin: {
                description:
                  "Used for pages that do not define a specific meta description.",
              },
            },
            {
              name: "defaultShareImage",
              label: "Default share image",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Recommended: 1200×630 PNG/JPG for rich previews (Open Graph + Twitter). Uses the Media item alt text for accessibility.",
              },
            },
            {
              name: "twitterHandle",
              label: "Twitter/X handle",
              type: "text",
              admin: {
                description:
                  "Optional. Example: @craigdavison (used for Twitter card metadata).",
              },
            },
          ],
        },
        {
          label: "Robots",
          fields: [
            {
              name: "preventIndexing",
              label: "Prevent indexing",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "Enable this to set `noindex, nofollow` site-wide (useful for staging environments).",
              },
            },
          ],
        },
      ],
    },
  ],
}

