/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
    // disable react compiler in production to avoid misterious user input bugs
    reactCompiler: process.env.NODE_ENV !== "production",
  },
  transpilePackages: ["geist"],
  output: "standalone",
};

export default config;
