/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  // 👇 This ensures Webpack is used instead of Turbopack
  // (Turbopack is auto-disabled when custom webpack config is present)
  reactStrictMode: true,

  webpack: (config: WebpackConfig): WebpackConfig => {
    // Ignore .md files to prevent esbuild binary issues
    config.module?.rules?.push({
      test: /\.md$/,
      type: "asset/source",
      exclude: /node_modules/,
    });

    // Ensure externals exists
    if (!config.externals) config.externals = [];

    // Prevent bundling esbuild native binaries
    if (Array.isArray(config.externals)) {
      config.externals.push("@esbuild/*");
    }

    return config;
  },
};

export default nextConfig;
