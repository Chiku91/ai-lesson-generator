import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig) => {
    // Ignore .md files
    config.module?.rules?.push({
      test: /\.md$/,
      type: "asset/source",
      exclude: /node_modules/,
    });

    // Make sure externals exists
    if (!config.externals) config.externals = [];

    // Prevent bundling esbuild native binaries
    if (Array.isArray(config.externals)) {
      config.externals.push("@esbuild/*");
    }

    return config;
  }
};

export default nextConfig;
