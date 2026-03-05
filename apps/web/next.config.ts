import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@socialflow/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
