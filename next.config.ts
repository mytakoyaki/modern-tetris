import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages用の設定
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 静的エクスポートの設定
  experimental: {
    esmExternals: false
  }
};

export default nextConfig;
