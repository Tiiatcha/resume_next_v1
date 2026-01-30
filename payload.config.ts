import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { resendAdapter } from "@payloadcms/email-resend";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/BlogCategories";
import { Tags } from "./collections/Tags";
import { TagCategories } from "./collections/TagCategories";
import { TagColors } from "./collections/TagColors";
import { BlogPosts } from "./collections/BlogPosts";
import { Endorsements } from "./collections/Endorsements";
import { EndorsementAccessChallenges } from "./collections/EndorsementAccessChallenges";
import { ChangelogEntries } from "./collections/ChangelogEntries";
import { Roadmap } from "./globals/Roadmap";
import { SiteSettings } from "./globals/SiteSettings";

import { s3Storage } from "@payloadcms/storage-s3";
import { Experiences } from "./collections/Experiences";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Validate that the Resend API key is configured.
 * Logs a warning if missing to help with debugging email issues.
 */
const resendApiKey = process.env.RESEND_API_KEY || "";
if (!resendApiKey) {
  console.warn(
    "⚠️  WARNING: RESEND_API_KEY environment variable is not set. Email notifications will not work.",
  );
} else {
  console.log("✅ Email notifications enabled (Resend API key configured)");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Tags,
    TagCategories,
    TagColors,
    Experiences,
    Endorsements,
    EndorsementAccessChallenges,
    BlogPosts,
    ChangelogEntries,
  ],
  globals: [Roadmap, SiteSettings],
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
          generateFileURL: (args: { filename: string }) => {
            const publicUrl = process.env.R2_URL || ""
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

        forcePathStyle: true,
      },
    }),
  ],
  email: resendAdapter({
    defaultFromName: "Craig Davison",
    defaultFromAddress: "hello@craigdavison.net",
    apiKey: resendApiKey,
  }),
});
