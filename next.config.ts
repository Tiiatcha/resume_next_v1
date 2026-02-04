import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "clipboard-read=(self), clipboard-write=(self)",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-066cec18020e480aaddb4f72d380b7a4.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default withPayload(nextConfig);
