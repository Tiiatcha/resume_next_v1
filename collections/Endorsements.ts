import type { CollectionConfig } from "payload"

/**
 * Endorsements from clients, colleagues, and managers.
 *
 * Design goals:
 * - **Low-friction submissions**: minimal required fields so people can quickly leave an endorsement.
 * - **Privacy-aware**: email is never exposed publicly; submitters choose which details are shown.
 * - **Moderated publishing**: all entries start as `pending` and must be manually approved.
 */
export const Endorsements: CollectionConfig = {
  slug: "endorsements",
  admin: {
    useAsTitle: "endorserName",
    defaultColumns: ["endorserName", "relationshipType", "status", "createdAt"],
    description:
      "Short endorsements from clients and colleagues. All new submissions start as pending and must be approved before they appear on the site.",
  },
  access: {
    read: ({ req }) => {
      // Anonymous visitors only see approved endorsements.
      // Authenticated admin users can read everything.
      if (req.user) return true

      return {
        status: {
          equals: "approved",
        },
      }
    },
    // Public submissions will go through a custom Next.js route that calls Payload
    // with `overrideAccess: true`. That keeps the REST API surface smaller and
    // lets us add additional protections (rate limiting, honeypot, etc.).
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Only endorsements marked as Approved will be displayed publicly on the site.",
      },
    },
    {
      name: "approvedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description:
          "Timestamp for when this endorsement was approved. Set automatically on first approval, but you can override it.",
      },
    },
    {
      name: "endorserName",
      label: "Name",
      type: "text",
      required: true,
      admin: {
        description:
          "Full name of the person giving the endorsement. They can choose whether this is shown publicly.",
      },
    },
    {
      name: "endorserEmail",
      label: "Email (never shown publicly)",
      type: "email",
      required: false,
      admin: {
        description:
          "Optional contact email used only for verification or clarification. This is never displayed on the public site.",
      },
      access: {
        // Ensure email can only be read inside the admin UI / by authenticated users.
        read: ({ req }) => Boolean(req.user),
      },
    },
    {
      name: "relationshipType",
      label: "Relationship",
      type: "select",
      required: true,
      options: [
        { label: "Client", value: "client" },
        { label: "Colleague", value: "colleague" },
        { label: "Manager", value: "manager" },
        { label: "Direct report", value: "directReport" },
        { label: "Other", value: "other" },
      ],
      admin: {
        description:
          "How this person has worked with you. This helps future employers and clients understand the context.",
      },
    },
    {
      name: "roleOrTitle",
      label: "Role or title (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Their role or title at the time you worked together (e.g. Delivery Manager, Product Owner, Lead Developer).",
      },
    },
    {
      name: "companyOrProject",
      label: "Company or project (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Company name or project context (e.g. Thames Water transformation programme).",
      },
    },
    {
      name: "linkedinUrl",
      label: "LinkedIn profile URL (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Optional LinkedIn profile link to lend extra credibility to the endorsement.",
      },
    },
    {
      name: "endorsementText",
      label: "Endorsement",
      type: "textarea",
      required: true,
      admin: {
        description:
          "2–4 sentences describing what it was like to work with you, focused on impact and reliability. You may lightly edit for clarity and spelling before publishing.",
      },
    },
    {
      name: "displayPreferences",
      label: "Display preferences",
      type: "group",
      admin: {
        description:
          "The submitter can choose which details are shown publicly alongside their endorsement.",
      },
      fields: [
        {
          name: "showNamePublicly",
          label: "Show my name publicly",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "showCompanyOrProjectPublicly",
          label: "Show my company/project publicly",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "showLinkedinUrlPublicly",
          label: "Show my LinkedIn profile link publicly",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
    {
      name: "consentToPublish",
      label: "Consent to publish",
      type: "checkbox",
      required: true,
      admin: {
        description:
          "The submitter must explicitly consent before their endorsement can be published on your site.",
      },
    },
    {
      name: "submissionMeta",
      label: "Submission metadata",
      type: "group",
      admin: {
        position: "sidebar",
        description:
          "Technical metadata captured at submission time (IP, user agent, etc.). Not shown publicly.",
      },
      fields: [
        {
          name: "ipAddress",
          label: "IP address",
          type: "text",
        },
        {
          name: "userAgent",
          label: "User agent",
          type: "text",
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // When an endorsement is first marked as approved, ensure it has an approval timestamp.
        if (
          data?.status === "approved" &&
          (!originalDoc || originalDoc.status !== "approved") &&
          !data?.approvedAt
        ) {
          return { ...data, approvedAt: new Date().toISOString() }
        }

        return data
      },
    ],
  },
}

