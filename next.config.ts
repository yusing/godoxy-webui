import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  cacheComponents: true, // Partial Pre-Rendering (Next.js 16)
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  rewrites: async () => [
    {
      source: '/wiki/:path*',
      destination: '/wiki/:path*.html',
    },
  ],
  // reactCompiler: {
  //   // compilationMode: 'annotation',
  //   compilationMode: 'infer',
  // },
}

export default config
