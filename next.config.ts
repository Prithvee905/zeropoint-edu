import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    // @ts-ignore - The type for experimental may not have turbopack
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;
