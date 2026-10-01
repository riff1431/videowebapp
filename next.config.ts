import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/channel/:username",
      },
    ];
  },
};

export default nextConfig;
