import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/Form",
        destination: "/web/form"
      }
    ];
  }
};

export default nextConfig;
