/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
    reactCompiler: process.env.NODE_ENV === "development",
  },
  output: "standalone",
};

export default config;
