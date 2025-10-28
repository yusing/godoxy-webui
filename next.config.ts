import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',

  // does not work with GoDoxy when modifying html body
  // cacheComponents: process.env.NODE_ENV !== 'development', // Partial Pre-Rendering (Next.js 16)
  enablePrerenderSourceMaps: true,
  // experimental: {
  //   turbopackFileSystemCacheForDev: process.env.NODE_ENV === 'development',
  // },
  rewrites: async () => [
    {
      source: '/wiki/:path*',
      destination: '/wiki/:path*.html',
    },
  ],
  // uncomment this when https://github.com/oven-sh/bun/issues/23554 is fixed
  // reactCompiler: {
  //   // compilationMode: 'annotation',
  //   compilationMode: 'infer',
  // },
}

export default config
