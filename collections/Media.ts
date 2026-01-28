import type { CollectionConfig } from 'payload'

/**
 * Media collection for file uploads.
 * 
 * Uses S3-compatible storage (Cloudflare R2) via the s3Storage plugin
 * configured in payload.config.ts.
 * 
 * Files are uploaded to R2 and served via public URLs.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility and SEO',
      },
    },
  ],
  upload: {
    // Image-specific upload configuration
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'feature',
        width: 1600,
        height: 900,
        position: 'centre',
      },
    ],
    // Allow common image and document types
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
