import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress workspace root warning
  experimental: {
    turbo: {
      root: ".",
    },
  },
};

export default nextConfig;
