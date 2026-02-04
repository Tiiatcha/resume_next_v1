import type { CollectionConfig } from "payload"

/**
 * Supported placeholder tokens for attribution parse patterns.
 * Use these in the pattern template to define what to extract from pasted content.
 *
 * - {{artist}} or {{artist_name}} → Artist name
 * - {{artist_url}} → Artist profile URL
 * - {{image_url}} → Link to original image/page
 * - {{site_name}} or {{platform_name}} → Platform name (e.g. "Unsplash")
 * - {{platform_url}} → Platform base URL
 *
 * Example patterns:
 *
 * Pexels: "Photo by {{artist_name}}: {{image_url}}"
 * Unsplash: "Photo by <a href=\"{{artist_url}}\">{{artist}}</a> on <a href=\"{{image_url}}\">{{site_name}}</a>"
 */
const PLACEHOLDER_DOCS = `Placeholders: {{artist}}, {{artist_name}}, {{artist_url}}, {{image_url}}, {{site_name}}, {{platform_name}}, {{platform_url}}`

export const StockMediaSites: CollectionConfig = {
  slug: "stock-media-sites",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "url", "updatedAt"],
    description:
      "Stock media sites (Unsplash, Pexels, etc.) used for image attribution. Define parse patterns so pasted attribution can be extracted automatically.",
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
        description: "Display name of the stock media site (e.g. Unsplash, Pexels).",
      },
    },
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "Base URL of the site (e.g. https://unsplash.com).",
      },
    },
    {
      name: "attributionParsePattern",
      label: "Attribution parse pattern",
      type: "textarea",
      required: true,
      admin: {
        description: `Template pattern matching the site's default attribution format. Replace dynamic values with placeholders. ${PLACEHOLDER_DOCS}`,
        placeholder:
          'Photo by {{artist}}: {{image_url}}\n\nOr for HTML: Photo by <a href="{{artist_url}}">{{artist}}</a> on {{site_name}}',
      },
    },
  ],
}
