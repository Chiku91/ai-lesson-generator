import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig): WebpackConfig => {
    // ✅ Ignore .md files (especially from esbuild’s win32 binary folder)
    config.module?.rules?.push({
      test: /\.md$/,
      type: 'asset/source',
      exclude: /node_modules/,
    });

    // ✅ Ensure externals array exists before modifying
    if (!config.externals) config.externals = [];

    // ✅ Prevent Next.js from trying to bundle native esbuild binaries
    if (Array.isArray(config.externals)) {
      config.externals.push('@esbuild/*');
    }

    return config;
  },
};

export default nextConfig;
