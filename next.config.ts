import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export so the whole thing can be served from GitHub Pages
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
