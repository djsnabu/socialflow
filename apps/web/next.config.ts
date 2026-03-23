import type { NextConfig } from "next";

const apiInternal = "http://api:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@socialflow/shared"],
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiInternal}/auth/:path*`,
      },
      {
        source: "/api/oauth/:path*",
        destination: `${apiInternal}/oauth/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${apiInternal}/auth/:path*`,
      },
      {
        source: "/oauth/:path*",
        destination: `${apiInternal}/oauth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiInternal}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
