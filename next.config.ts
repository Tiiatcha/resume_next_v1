import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-066cec18020e480aaddb4f72d380b7a4.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withPayload(nextConfig);
