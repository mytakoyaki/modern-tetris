import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'modern-tetris';

const nextConfig: NextConfig = {
  // GitHub Pages用の設定
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pagesでのパス設定
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  // 静的エクスポートの設定
  distDir: 'out'
};

export default nextConfig;
