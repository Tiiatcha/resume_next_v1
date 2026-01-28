import type { GlobalConfig } from "payload"

/**
 * Roadmap page content.
 *
 * Why this is a Global (not a Collection):
 * - There is a single canonical roadmap page (`/roadmap`)
 * - The UI is intentionally simple (three fixed columns: Now / Next / Later)
 * - Editors should be able to update copy without thinking about "documents"
 *
 * The page is rendered by Next.js and only pulls *content* from Payload.
 * Presentation (layout, status badge colors, animations) remains in code.
 */
export const Roadmap: GlobalConfig = {
  slug: "roadmap",
  label: "Roadmap",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  versions: {
    // Enables draft/publish and preview flows for this page content.
    drafts: true,
  },
  admin: {
    description:
      "Content shown on the public /roadmap page. Update the copy and bullets here without changing code.",
  },
  fields: [
    {
      name: "kicker",
      label: "Kicker",
      type: "text",
      required: true,
      defaultValue: "Site roadmap",
      admin: {
        description: "Small uppercase label above the heading.",
      },
    },
    {
      name: "heading",
      label: "Heading",
      type: "text",
      required: true,
      defaultValue: "What I’m building next",
    },
    {
      name: "lead",
      label: "Lead paragraph",
      type: "textarea",
      required: true,
      defaultValue:
        "This site is intentionally evolving. The goal is to keep the CV fast and readable while adding CMS-backed content that’s easy to maintain (projects, experience, endorsements, and a small blog).",
    },
    {
      name: "note",
      label: "Note",
      type: "text",
      defaultValue: "Note: this is a direction-of-travel list, not a promise of dates.",
    },
    {
      name: "ctaLinks",
      label: "CTA links",
      type: "array",
      admin: {
        description:
          "Optional buttons shown under the intro copy (e.g. anchor links to sections on the homepage).",
      },
      fields: [
        {
          name: "label",
          label: "Label",
          type: "text",
          required: true,
        },
        {
          name: "href",
          label: "Href",
          type: "text",
          required: true,
          admin: {
            description: "Internal links (e.g. /#projects) are recommended.",
          },
        },
        {
          name: "variant",
          label: "Variant",
          type: "select",
          required: true,
          defaultValue: "outline",
          options: [
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
          ],
        },
      ],
      defaultValue: [
        { label: "View projects", href: "/#projects", variant: "outline" },
        { label: "View experience", href: "/#experience", variant: "ghost" },
      ],
    },
    {
      name: "now",
      label: "Now",
      type: "group",
      admin: {
        description: "Items you are actively working on right now.",
      },
      fields: roadmapColumnFields({
        defaultTitle: "Payload CMS foundation",
        defaultDescription:
          "Introduce an editorial workflow so content updates don’t require code changes.",
        defaultBullets: [
          "Add Payload CMS (auth + admin) with a clean content model",
          "Move projects and experience to CMS-backed collections",
          "Add an endorsements collection with moderation + “featured” support",
        ],
      }),
    },
    {
      name: "next",
      label: "Next",
      type: "group",
      admin: {
        description: "Items you plan to tackle once the current work lands.",
      },
      fields: roadmapColumnFields({
        defaultTitle: "Mini blog + richer project case studies",
        defaultDescription: "Make it easier to share learnings and show depth per project.",
        defaultBullets: [
          "Add blog posts with draft/publish states and tags",
          "Support richer content blocks (images, links, callouts)",
          "Add project detail pages generated from CMS content",
        ],
      }),
    },
    {
      name: "later",
      label: "Later",
      type: "group",
      admin: {
        description: "Longer-term improvements and operational polish.",
      },
      fields: roadmapColumnFields({
        defaultTitle: "Polish, discoverability, and ops",
        defaultDescription:
          "Improve navigation, long-term maintainability, and content distribution.",
        defaultBullets: [
          "RSS feed for blog posts",
          "Privacy-friendly analytics for content performance",
          "Performance and accessibility audits as the site grows",
        ],
      }),
    },
  ],
}

type RoadmapColumnDefaults = {
  defaultTitle: string
  defaultDescription: string
  defaultBullets: string[]
}

function roadmapColumnFields(defaults: RoadmapColumnDefaults): GlobalConfig["fields"] {
  return [
    {
      name: "isVisible",
      label: "Visible",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Toggle to hide this column from the public roadmap page.",
      },
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      defaultValue: defaults.defaultTitle,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      defaultValue: defaults.defaultDescription,
    },
    {
      name: "bullets",
      label: "Bullets",
      type: "array",
      required: true,
      minRows: 1,
      defaultValue: defaults.defaultBullets.map((text) => ({ text })),
      fields: [
        {
          name: "text",
          label: "Bullet",
          type: "text",
          required: true,
        },
      ],
    },
  ]
}

