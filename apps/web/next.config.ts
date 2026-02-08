import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Use relative paths for assets so they work with both http:// and file:// protocols
  assetPrefix: "./",
};

export default nextConfig;
