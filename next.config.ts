import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/Form",
        destination: "/web/form"
      },
      {
        source: "/Calendar",
        destination: "/web/calendar"
      }
    ];
  }
};

export default nextConfig;
