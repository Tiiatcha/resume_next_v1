import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { BlogPosts } from "./collections/BlogPosts";
import { Endorsements } from "./collections/Endorsements";

import { s3Storage } from "@payloadcms/storage-s3";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, BlogPosts, Endorsements],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          // Public URL configuration - REQUIRED for images to display
          // This tells Payload where to access the uploaded files
          generateFileURL: (args: { filename: string }) => {
            const publicUrl = process.env.R2_URL || ""
            // Files are stored in the 'media' prefix, so include it in the URL
            return `${publicUrl}/resume/${args.filename}`
          },
        },
      },
      bucket: process.env.R2_BUCKET ?? "",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_KEY || "",
        },
        region: "auto",
        endpoint: process.env.R2_ENDPOINT || "",
        // CRITICAL for R2: Use path-style URLs instead of virtual-hosted style
        forcePathStyle: true,
      },
    }),
  ],
});
