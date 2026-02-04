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
    {
      name: 'stockMediaSite',
      label: 'Stock media site',
      type: 'relationship',
      relationTo: 'stock-media-sites',
      hasMany: false,
      admin: {
        description:
          'Select the site this image came from (e.g. Unsplash, Pexels). Used for attribution and to parse pasted attribution text.',
      },
    },
    {
      name: 'imageAttribution',
      label: 'Image attribution',
      type: 'group',
      admin: {
        description:
          'Optional credit line for stock/third-party images (e.g. Unsplash). If any field is filled, we will render a subtle “Photo by … on …” attribution wherever this media item is used.',
      },
      fields: [
        {
          name: 'attributionParseTrigger',
          type: 'ui',
          admin: {
            components: {
              Field: './components/features/media/AttributionParseButton#AttributionParseButton',
            },
          },
        },
        {
          name: 'platformName',
          label: 'Platform name',
          type: 'text',
          admin: {
            placeholder: 'Unsplash',
          },
        },
        {
          name: 'platformUrl',
          label: 'Platform URL',
          type: 'text',
          admin: {
            placeholder: 'https://unsplash.com',
            description:
              'Link to the platform (or the platform’s credit URL if required).',
          },
        },
        {
          name: 'artistName',
          label: 'Artist name',
          type: 'text',
          admin: {
            placeholder: 'Glenn Carstens-Peters',
          },
        },
        {
          name: 'artistUrl',
          label: 'Artist URL',
          type: 'text',
          admin: {
            placeholder: 'https://unsplash.com/@glenncarstenspeters',
            description: 'Link to the artist/photographer profile page.',
          },
        },
        {
          name: 'imageUrl',
          label: 'Image URL',
          type: 'text',
          admin: {
            placeholder: 'https://unsplash.com/photos/npxXWgQ33ZQ',
            description:
              'Link to the original image page (often required for attribution).',
          },
        },
      ],
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
