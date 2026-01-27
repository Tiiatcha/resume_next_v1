import type { CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: true,
  fields: [
    // Email added by default
    {
      type: "collapsible",
      label: "Profile",
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: "firstName",
          label: "First name",
          type: "text",
          required: true,
        },
        {
          name: "lastName",
          label: "Last name",
          type: "text",
          required: true,
        },
        {
          name: "username",
          label: "Username",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: {
            description:
              "Shown in the admin UI and can be used publicly (e.g. author byline). Must be unique.",
          },
        },
        {
          name: "avatar",
          label: "Avatar",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Optional profile image (stored in the Media collection).",
          },
        },
      ],
    },
  ],
}
