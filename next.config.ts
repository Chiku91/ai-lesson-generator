import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  env: {
    HELICONE_API_KEY: process.env.HELICONE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  webpack: (config: WebpackConfig): WebpackConfig => {
    // Add markdown loader
    config.module?.rules?.push({
      test: /\.md$/,
      type: "asset/source",
      exclude: /node_modules/,
    });

    // Ensure externals exists
    if (!config.externals) {
      config.externals = [];
    }

    // Prevent bundling esbuild native binaries
    if (Array.isArray(config.externals)) {
      config.externals.push("@esbuild/*");
    }

    return config;
  },
};

export default nextConfig;
