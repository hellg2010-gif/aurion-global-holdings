import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/governance", destination: "/api/governance" },
      {
        source: "/governance/:path*",
        destination: "/api/governance/:path*",
      },
    ];
  },
};

export default nextConfig;
