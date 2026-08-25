import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/web/login"
      }
    ];
  }
};

export default nextConfig;
