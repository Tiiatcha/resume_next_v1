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
      "Site-wide hub: SEO defaults, contact info, CV/downloads, feature toggles, and legal policy content. Individual pages can override SEO in code when needed.",
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
        {
          label: "Contact",
          fields: [
            {
              name: "contactEmail",
              label: "Contact email",
              type: "email",
              admin: {
                description: "Primary contact email shown across the site (footer, contact section). Leave empty to hide or use fallback.",
              },
            },
            {
              name: "contactPhone",
              label: "Contact phone",
              type: "text",
              admin: {
                description: "Optional. Display number for tel: links and contact section.",
              },
            },
            {
              name: "contactLocation",
              label: "Contact location",
              type: "text",
              admin: {
                description: "Optional. Human-readable location (e.g. “Leicestershire, UK”).",
              },
            },
            {
              name: "contactWhatsApp",
              label: "WhatsApp number",
              type: "text",
              admin: {
                description:
                  "Optional. E.164 format (digits only, with country code, no +). Used for WhatsApp deep links.",
              },
            },
          ],
        },
        {
          label: "CV / Downloads",
          fields: [
            {
              name: "cvCurrent",
              label: "Current CV file",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Primary CV PDF. Upload a PDF to the Media library; this field links to it. PDF is recommended for compatibility.",
              },
            },
            {
              name: "cvDisplayName",
              label: "CV display name",
              type: "text",
              admin: {
                description: "Optional. Label shown for the download (e.g. “Craig Davison CV (Full-stack)”).",
              },
            },
            {
              name: "cvLastUpdated",
              label: "CV last updated",
              type: "date",
              admin: {
                description: "Optional. Date the current CV was last updated.",
              },
            },
            {
              name: "cvVariants",
              label: "CV variants",
              type: "array",
              admin: {
                description:
                  "Optional. Alternative CV versions (e.g. short vs full). If you set “Default”, use only one per site; multiple defaults are not enforced.",
              },
              fields: [
                {
                  name: "label",
                  label: "Label",
                  type: "text",
                  required: true,
                  admin: { description: "e.g. “Short version”, “Full-stack”." },
                },
                {
                  name: "file",
                  label: "File",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  admin: { description: "PDF upload from Media." },
                },
                {
                  name: "isDefault",
                  label: "Default variant",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    description: "Mark as the default download when multiple variants exist. Prefer only one default.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Features",
          fields: [
            {
              name: "enableBlog",
              label: "Enable blog",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the Blog link in navigation and allow access to the blog section.",
              },
            },
            {
              name: "enableEndorsements",
              label: "Enable endorsements",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the Endorsements section on the homepage and in navigation.",
              },
            },
            {
              name: "enableRoadmap",
              label: "Enable roadmap",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the Roadmap link and allow access to the roadmap page.",
              },
            },
            {
              name: "enableChangelog",
              label: "Enable changelog",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the Changelog link and allow access to the changelog page.",
              },
            },
            {
              name: "enableContactForm",
              label: "Enable contact form",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the Contact section (and contact form if implemented) on the homepage.",
              },
            },
            {
              name: "enableCvDownload",
              label: "Enable CV download",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show the CV download button in the footer and any CV download CTAs.",
              },
            },
          ],
        },
        {
          label: "Legal",
          fields: [
            {
              name: "privacyPolicyContent",
              label: "Privacy policy content",
              type: "richText",
              admin: {
                description:
                  "Source of truth for the Privacy Policy page. Render this rich text on your privacy policy route; add the page/link in your nav or footer separately.",
              },
            },
            {
              name: "cookiePolicyContent",
              label: "Cookie policy content",
              type: "richText",
              admin: {
                description:
                  "Source of truth for the Cookie Policy page. Render this rich text on your cookie policy route; add the page/link in your nav or footer separately.",
              },
            },
            {
              name: "legalLastUpdated",
              label: "Legal last updated",
              type: "date",
              admin: {
                description: "Optional. Date when privacy/cookie policies were last updated.",
              },
            },
          ],
        },
      ],
    },
  ],
}

