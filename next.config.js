/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "godoxy-schemas"],
  },
  transpilePackages: ["geist"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
};

export default config;
