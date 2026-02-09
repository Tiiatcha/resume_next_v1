import type { GlobalConfig } from "payload"

export const SiteNavigation: GlobalConfig = {
  slug: "site-navigation",
  label: "Site navigation",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    description: "Site navigation settings",
  },
  fields: [
    {
      name: "navigation",
      type: "array",
      admin: {
        components: {
          RowLabel: {
            path: "./components/payload/array-row-label",
            clientProps: {
              field: "label",
              fallbackLabel: "Navigation item",
            },
          },
        },
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            description: "Label for the navigation item",
            
          },
        },
        {
          name: "href",
          type: "text",
          required: true,
        },
        {
            name:"openInNewTab",
            type: "checkbox",
            required: true,
            defaultValue: false,
            admin: {
                description: "Open the link in a new tab",
            },
        },
        {
            name:"icon",
            type: "text",
            required: true,
            admin: {
                description: "Icon to display for the navigation item",
            },
        },
        
      ],
    },
  ],
}