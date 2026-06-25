import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  transpilePackages: [
    "@bitjson/qr-code",
    "@new-qr/qr-scene",
    "@new-qr/qr-scene-bitjson",
    "@new-qr/qr-scene-core",
    "@new-qr/qr-scene-export",
    "@new-qr/qr-scene-paper",
    "@new-qr/qr-scene-react",
    "@new-qr/qr-scene-schema",
  ],
};

export default nextConfig;
