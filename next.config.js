/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "@/types/godoxy"],
  },
  transpilePackages: ["geist"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.devtool = false;
    config.optimization.minimize = true;
    }
    config.optimization.splitChunks = {
      chunks: 'all',
    };
    config.optimization.runtimeChunk = 'single';
    return config;
  },
  redirects: async () => [
    {
      source: "/auth/callback",
      destination: "/api/auth/callback",
      permanent: false,
    },
    {
      source: "/v1/:path*",
      destination: "/api/:path*",
      permanent: false,
    },
  ],
  rewrites: async () => [
    {
      source: "/wiki/:path*",
      destination: "/wiki/:path*.html",
    },
  ],
};

export default withBundleAnalyzer(config);
