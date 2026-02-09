import type { CollectionConfig } from "payload"
/**
 * Page configuration documents keyed by `pageKey`.
 *
 * Intent:
 * - Keep layout and component structure in code (Next.js).
 * - Allow selected hero + section copy/media + SEO overrides to be edited in Payload.
 * - Avoid a full page-builder / blocks system for now.
 */
export const PageConfigs: CollectionConfig = {
  slug: "page-configs",
  admin: {
    useAsTitle: "pageKey",
    defaultColumns: ["pageKey", "updatedAt"],
    description:
      "Content and configuration for code-owned pages, keyed by `pageKey` (e.g. `home`). Layout stays in code; this collection only supplies copy, media, and SEO overrides.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Page details",
          fields: [
            {
              name: "pageKey",
              type: "text",
              required: true,
              unique: true,
              index: true,
              admin: {
                description:
                  "Stable key used by the frontend to look up this config (e.g. `home`, `about`).",
              },
            },
            {
              name: "hero",
              type: "group",
              label: "Hero",
              admin: {
                description:
                  "Optional hero content for this page. The frontend decides how to render and position this content.",
              },
              fields: [
                {
                  name: "eyebrow",
                  label: "Eyebrow",
                  type: "text",
                  admin: {
                    description:
                      "Short label above the main heading (e.g. “Online CV”).",
                  },
                },
                {
                  name: "heading",
                  label: "Heading",
                  type: "text",
                  admin: {
                    description: "Primary hero heading for this page.",
                  },
                },
                {
                  name: "lead",
                  label: "Lead",
                  type: "textarea",
                  admin: {
                    description:
                      "Short lead paragraph under the heading. Keep it concise and user-focused.",
                  },
                },
                {
                  name: "media",
                  label: "Hero media",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description:
                      "Optional hero image/media. The frontend may use this as a background layer or inline image and will handle attribution automatically.",
                  },
                },
                {
                  name: "ctas",
                  label: "Hero CTAs",
                  type: "array",
                  maxRows: 2,
                  admin: {
                    description:
                      "Primary calls-to-action for the hero. Up to two buttons; the frontend will render these using the shared Button component.",
                  },
                  fields: [
                    {
                      name: "label",
                      label: "Label",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "variant",
                      label: "Button variant",
                      type: "select",
                      defaultValue: "default",
                      options: [
                        { label: "Default", value: "default" },
                        { label: "Outline", value: "outline" },
                        { label: "Secondary", value: "secondary" },
                        { label: "Ghost", value: "ghost" },
                        { label: "Link", value: "link" },
                        { label: "Destructive", value: "destructive" },
                      ],
                      admin: {
                        description:
                          "Visual variant for the button. These map directly to the `variant` prop of the shared Button component.",
                      },
                    },
                    {
                      name: "linkKind",
                      label: "Link type",
                      type: "select",
                      required: true,
                      defaultValue: "internal",
                      options: [
                        { label: "Internal", value: "internal" },
                        { label: "External", value: "external" },
                      ],
                      admin: {
                        description:
                          "Internal links are typically on-site routes or anchors (e.g. “#contact”). External links are full URLs.",
                      },
                    },
                    {
                      name: "internalLinkMode",
                      label: "Internal link mode",
                      type: "select",
                      defaultValue: "document",
                      options: [
                        { label: "Collection document", value: "document" },
                        { label: "Route / anchor", value: "route" },
                      ],
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "internal",
                        description:
                          "Choose whether this internal link points to a simple route/anchor or a specific document (e.g. a blog post or media item).",
                      },
                    },
                    {
                      name: "internalHref",
                      label: "Internal href",
                      type: "text",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "route",
                        description:
                          "Internal path or anchor (e.g. “#contact” or “/blog”). The frontend is responsible for choosing between <Link> and <a>.",
                      },
                    },
                    {
                      name: "internalCollection",
                      label: "Internal collection",
                      type: "select",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document",
                        description:
                          "Choose which internal content type to link to. Add more options as new content types ship.",
                      },
                      options: [
                        { label: "Blog posts", value: "blog-posts" },
                        { label: "Media", value: "media" },
                      ],
                    },
                    {
                      name: "internalBlogPost",
                      label: "Blog post",
                      type: "relationship",
                      relationTo: "blog-posts",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document" &&
                          siblingData?.internalCollection === "blog-posts",
                        description:
                          "Select the blog post to link to. The frontend will map this to the appropriate route.",
                      },
                    },
                    {
                      name: "internalMedia",
                      label: "Media/file",
                      type: "upload",
                      relationTo: "media",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document" &&
                          siblingData?.internalCollection === "media",
                        description:
                          "Select a media/file item from the library (e.g. a CV PDF). The frontend will map this to the media URL or a detail route.",
                      },
                    },
                    {
                      name: "externalUrl",
                      label: "External URL",
                      type: "text",
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "external",
                        description: "Full external URL (e.g. https://example.com).",
                      },
                    },
                    {
                      name: "openInNewTab",
                      label: "Open in new tab",
                      type: "checkbox",
                      defaultValue: false,
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "external",
                        description:
                          "Only respected for external URLs. The frontend will map this to target/rel attributes.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Sections",
          fields: [
            {
              name: "sections",
              label: "Sections",
              type: "array",
              admin: {
                description:
                  "Free-form content buckets keyed by `sectionKey` (e.g. “about”). The frontend will pick and choose from these as needed.",
                components: {
                  RowLabel: {
                    path: "./components/payload/array-row-label",
                    clientProps: {
                      field: "sectionKey",
                      fallbackLabel: "Section",
                    },
                  },
                },
              },
              fields: [
                {
                  name: "sectionKey",
                  label: "Section key",
                  type: "text",
                  required: true,
                  admin: {
                    description:
                      "Stable identifier for this section (e.g. “about”, “hero”, “contact”). The frontend uses this to find the right content.",
                  },
                },
                {
                  name: "notes",
                  label: "Editor notes",
                  type: "textarea",
                  admin: {
                    description:
                      "Optional notes for editors. Not used on the frontend.",
                  },
                },
                {
                  name: "eyebrow",
                  label: "Eyebrow",
                  type: "text",
                },
                {
                  name: "heading",
                  label: "Heading",
                  type: "text",
                },
                {
                  name: "sectionIntro",
                  label: "Section intro",
                  type: "richText",
                  admin: {
                    description:
                      "Intro text for this section. This will be displayed below the heading.",
                  },
                },
                
                {
                  name: "copy",
                  label: "Copy",
                  type: "richText",
                  admin: {
                    description:
                      "Rich text content for this section. Use headings, links, and lists as needed.",
                  },
                },
                {
                  name: "media",
                  label: "Media",
                  type: "upload",
                  relationTo: "media",
                },
                {
                  name: "sectionClose",
                  label: "Section Close",
                  type: "richText",
                  admin: {
                    description:
                      "Close text for this section. This will be displayed after the copy. and lead into the section cta",
                  },
                },
                
                
                {
                  name: "ctas",
                  label: "Section CTAs",
                  type: "array",
                  admin: {
                    description:
                      "Optional calls-to-action specific to this section. The frontend can opt-in to render these where appropriate.",
                  },
                  fields: [
                    {
                      name: "label",
                      label: "Label",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "variant",
                      label: "Button variant",
                      type: "select",
                      defaultValue: "default",
                      options: [
                        { label: "Default", value: "default" },
                        { label: "Outline", value: "outline" },
                        { label: "Secondary", value: "secondary" },
                        { label: "Ghost", value: "ghost" },
                        { label: "Link", value: "link" },
                        { label: "Destructive", value: "destructive" },
                      ],
                      admin: {
                        description:
                          "Visual variant for the button. These map directly to the `variant` prop of the shared Button component.",
                      },
                    },
                    {
                      name: "linkKind",
                      label: "Link type",
                      type: "select",
                      required: true,
                      defaultValue: "internal",
                      options: [
                        { label: "Internal", value: "internal" },
                        { label: "External", value: "external" },
                      ],
                      admin: {
                        description:
                          "Internal links are typically on-site routes or anchors (e.g. “#contact”). External links are full URLs.",
                      },
                    },
                    {
                      name: "internalLinkMode",
                      label: "Internal link mode",
                      type: "select",
                      defaultValue: "route",
                      options: [
                        { label: "Route / anchor", value: "route" },
                        { label: "Collection document", value: "document" },
                      ],
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "internal",
                        description:
                          "Choose whether this internal link points to a simple route/anchor or a specific document (e.g. a blog post or media item).",
                      },
                    },
                    {
                      name: "internalHref",
                      label: "Internal href",
                      type: "text",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "route",
                        description:
                          "Internal path or anchor (e.g. “#contact” or “/blog”). The frontend is responsible for choosing between <Link> and <a>.",
                      },
                    },
                    {
                      name: "internalCollection",
                      label: "Internal collection",
                      type: "select",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document",
                        description:
                          "Choose which internal content type to link to. Add more options as new content types ship.",
                      },
                      options: [
                        { label: "Blog posts", value: "blog-posts" },
                        { label: "Media", value: "media" },
                      ],
                    },
                    {
                      name: "internalBlogPost",
                      label: "Blog post",
                      type: "relationship",
                      relationTo: "blog-posts",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document" &&
                          siblingData?.internalCollection === "blog-posts",
                        description:
                          "Select the blog post to link to. The frontend will map this to the appropriate route.",
                      },
                    },
                    {
                      name: "internalMedia",
                      label: "Media/file",
                      type: "upload",
                      relationTo: "media",
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.linkKind === "internal" &&
                          siblingData?.internalLinkMode === "document" &&
                          siblingData?.internalCollection === "media",
                        description:
                          "Select a media/file item from the library (e.g. a CV PDF). The frontend will map this to the media URL or a detail route.",
                      },
                    },
                    {
                      name: "externalUrl",
                      label: "External URL",
                      type: "text",
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "external",
                        description: "Full external URL (e.g. https://example.com).",
                      },
                    },
                    {
                      name: "openInNewTab",
                      label: "Open in new tab",
                      type: "checkbox",
                      defaultValue: false,
                      admin: {
                        condition: (_, siblingData) => siblingData?.linkKind === "external",
                        description:
                          "Only respected for external URLs. The frontend will map this to target/rel attributes.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              label: "SEO title override",
              type: "text",
              admin: {
                description:
                  "Optional page title override. If empty, the site-wide default from Site settings is used.",
              },
            },
            {
              name: "seoDescription",
              label: "SEO description override",
              type: "textarea",
              admin: {
                description:
                  "Optional meta description override for this page. If empty, the site-wide default is used.",
              },
            },
            {
              name: "shareImage",
              label: "Share image override",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Optional Open Graph/Twitter share image specific to this page. If empty, the default share image from Site settings is used.",
              },
            },
            {
              name: "canonicalUrl",
              label: "Canonical URL override",
              type: "text",
              admin: {
                description:
                  "Optional canonical URL for this page. Leave empty to use the automatically derived canonical from Site settings.",
              },
            },
            {
              name: "preventIndexing",
              label: "Prevent indexing for this page",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "When enabled, this page will request `noindex` regardless of the site-wide robots setting.",
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure `sections` has at most one row per sectionKey (case-insensitive).
        const rows = Array.isArray(data?.sections) ? data.sections : []
        const seen = new Set<string>()

        for (const row of rows) {
          if (!row || typeof row !== "object") continue
          const rawKey = typeof row.sectionKey === "string" ? row.sectionKey : ""
          const normalised = rawKey.trim().toLowerCase()
          if (!normalised) continue

          if (seen.has(normalised)) {
            throw new Error(
              `Duplicate sectionKey "${rawKey}" in sections. Each sectionKey must be unique within a single page config.`,
            )
          }

          seen.add(normalised)
        }

        return data
      },
    ],
  },
}

