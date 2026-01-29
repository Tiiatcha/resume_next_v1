import type { CollectionConfig } from "payload"

/**
 * Work experience entries for the CV/resume.
 *
 * Key decision:
 * - We store dates as real `date` fields (ISO timestamps in the DB).
 * - Display formatting (e.g. "2024-Jan", "Present") is a UI concern handled later.
 *
 * Why `isCurrentRole` exists:
 * - A current role doesn’t have an end date; the UI can render "Present" when `isCurrentRole === true`.
 * - We avoid storing magic strings like "Present" in the database.
 */
export const Experiences: CollectionConfig = {
    slug: "experiences",
    admin: {
        useAsTitle: "company",
        defaultColumns: [
            "company",
            "title",
            "fromDate",
            "toDate",
            "isCurrentRole",
            "sortOrder",
            "updatedAt",
        ],
        description:
            "CV experience entries. Dates are stored as real dates; the UI will format them later (e.g. yyyy-MMM, with “Present” for current roles).",
    },
    access: {
        read: () => true,
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
    },
    fields: [
        {
            name: "company",
            type: "text",
            required: true,
            admin: {
                description: "Company/organisation name (e.g. “Cadent Gas”).",
            },
        },
        {
            name: "title",
            type: "text",
            required: true,
            admin: {
                description: "Role title (e.g. “Lead Developer”).",
            },
        },

        {
            name: "fromDate",
            label: "From",
            type: "date",
            required: true,
            admin: {
                description:
                    "Start date for the role. The UI will decide how to format it (e.g. yyyy-MMM).",
            },
        },
        {
            name: "isCurrentRole",
            label: "Current role",
            type: "checkbox",
            defaultValue: false,
            admin: {
                position: "sidebar",
                description:
                    "Enable this for your current role. When enabled, the UI can render the end date as “Present”.",
            },
        },
        {
            name: "toDate",
            label: "To",
            type: "date",
            admin: {
                description:
                    "End date for the role. Leave empty when “Current role” is enabled.",
                condition: (_, siblingData) => {
                    const isCurrentRole =
                        typeof siblingData === "object" &&
                        siblingData !== null &&
                        "isCurrentRole" in siblingData &&
                        (siblingData as { isCurrentRole?: unknown }).isCurrentRole === true

                    return !isCurrentRole
                },
            },
            validate: (value, { siblingData }) => {
                const isCurrentRole =
                    typeof siblingData === "object" &&
                    siblingData !== null &&
                    "isCurrentRole" in siblingData &&
                    (siblingData as { isCurrentRole?: unknown }).isCurrentRole === true

                if (isCurrentRole) return true
                if (value) return true
                return "End date is required unless this is marked as a current role."
            },
        },

        {
            name: "sortOrder",
            type: "number",
            defaultValue: 0,
            admin: {
                position: "sidebar",
                description:
                    "Controls ordering on the resume. Decide the sort logic in the UI (e.g. descending by fromDate, then by sortOrder).",
            },
        },

        {
            name: "content",
            type: "group",
            required: true,
            admin: {
                description:
                    "Structured content for the experience entry. Mirrors your current “mixed” model (paragraphs + headed bullet sections).",
            },
            fields: [
                {
                    name: "type",
                    type: "select",
                    required: true,
                    defaultValue: "mixed",
                    options: [{ label: "Mixed", value: "mixed" }],
                    admin: {
                        description:
                            "Experiences currently use `type: mixed` (paragraph blocks plus headed bullet sections).",
                    },
                },
                {
                    name: "sections",
                    type: "array",
                    required: true,
                    minRows: 1,
                    admin: {
                        description:
                            "Content blocks rendered in order. Use a Paragraph for narrative text, and a Section for headed bullet lists.",
                    },
                    fields: [
                        {
                            name: "type",
                            type: "select",
                            required: true,
                            options: [
                                { label: "Paragraph", value: "paragraph" },
                                { label: "Section (heading + bullet list)", value: "section" },
                            ],
                            admin: {
                                description: "Select the block type for this row.",
                            },
                        },
                        {
                            name: "text",
                            type: "textarea",
                            admin: {
                                condition: (_, siblingData) => siblingData?.type === "paragraph",
                                description:
                                    "Paragraph text. Keep it readable and impact-focused.",
                            },
                        },
                        {
                            name: "heading",
                            type: "text",
                            admin: {
                                condition: (_, siblingData) => siblingData?.type === "section",
                                description:
                                    "Section heading (e.g. “Key Tasks and responsibilities”).",
                            },
                        },
                        {
                            name: "items",
                            type: "array",
                            admin: {
                                condition: (_, siblingData) => siblingData?.type === "section",
                                description:
                                    "Bullet points for the section. Keep each item short and specific.",
                            },
                            fields: [
                                {
                                    name: "item",
                                    type: "text",
                                    required: true,
                                    admin: { description: "A single bullet point." },
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        {
            name: "tags",
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
            filterOptions: {
                // Only show tags that explicitly apply to experiences.
                // This keeps the picker clean and relevant.
                scopes: { contains: "experiences" },
            },
            admin: {
                position: "sidebar",
                description:
                    "Technologies/skills used in this role. Select from the centralized tags collection.",
            },
        },
    ],

    hooks: {
        beforeValidate: [
            ({ data }) => {
                // Defensive cleanup: if marked current, ensure we never persist an end date.
                if (data?.isCurrentRole) {
                    return { ...data, toDate: null }
                }
                return data
            },
        ],
        beforeChange: [
            ({ data }) => {
                // Cross-field sanity check: if both dates exist, `fromDate` must be <= `toDate`.
                if (!data?.fromDate || !data?.toDate) return data

                const from = new Date(data.fromDate).getTime()
                const to = new Date(data.toDate).getTime()

                if (Number.isNaN(from) || Number.isNaN(to)) return data
                if (from > to) {
                    throw new Error("From date must be before (or equal to) To date.")
                }

                return data
            },
        ],
    },
}