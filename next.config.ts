import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  transpilePackages: ["@new-qr/qr"],
};

export default nextConfig;
