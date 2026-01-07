import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',

  // does not work with GoDoxy when modifying html body
  // cacheComponents: process.env.NODE_ENV !== 'development', // Partial Pre-Rendering (Next.js 16)
  enablePrerenderSourceMaps: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  transpilePackages: ['juststore', 'juststore-shadcn'],
  rewrites: async () => [
    {
      source: '/wiki/:path*',
      destination: '/wiki/:path*.html',
    },
  ],
  reactCompiler: {
    compilationMode: 'annotation',
  },
}

export default config
