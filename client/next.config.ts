import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic configuration only
  eslint: {
    // Ignore ESLint errors during build for now
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
