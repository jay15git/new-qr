import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  transpilePackages: ["@bitjson/qr-code"],
};

export default nextConfig;
