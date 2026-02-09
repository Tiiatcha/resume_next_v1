import { mongooseAdapter } from "@payloadcms/db-mongodb";
import path from "path";
import { sharedLexicalEditor } from "./lib/lexical-editor";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { resendAdapter } from "@payloadcms/email-resend";
// collections
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { StockMediaSites } from "./collections/StockMediaSites";
import { Categories } from "./collections/BlogCategories";
import { Tags } from "./collections/Tags";
import { TagCategories } from "./collections/TagCategories";
import { TagColors } from "./collections/TagColors";
import { BlogPosts } from "./collections/BlogPosts";
import { Endorsements } from "./collections/Endorsements";
import { EndorsementAccessChallenges } from "./collections/EndorsementAccessChallenges";
import { ChangelogEntries } from "./collections/ChangelogEntries";
import { Experiences } from "./collections/Experiences";
import { PageConfigs } from "./collections/PageConfigs";
// globals
import { Roadmap } from "./globals/Roadmap";
import { SiteSettings } from "./globals/SiteSettings";
import { SiteNavigation } from "./globals/SiteNavigation";
// storage adapters
import { s3Storage } from "@payloadcms/storage-s3";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);




export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: "yyyy-MMM-dd",
  },
  cors:{
    origins: ["https://craigdavison.net", "https://www.craigdavison.net","http://localhost:3000"],
    // headers: ["Content-Type", "Authorization"],
  },
  csrf:[
    "https://craigdavison.net",
    "https://www.craigdavison.net",
    "http://localhost:3000",
  ],
  collections: [
    EndorsementAccessChallenges,
    Users,
    Media,
    StockMediaSites,
    Categories,
    Tags,
    TagCategories,
    TagColors,
    PageConfigs,
    Experiences,
    Endorsements,
    BlogPosts,
    ChangelogEntries,
  ],
  globals: [
    SiteSettings, 
    SiteNavigation,
    Roadmap,
  ],
  editor: sharedLexicalEditor,
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
