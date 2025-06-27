import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages用の設定
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
