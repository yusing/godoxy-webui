import type { NextConfig } from 'next'

const rewrites = [
  {
    source: '/wiki/:path*',
    destination: '/wiki/:path*.html',
  },
]

if (process.env.DEMO_SITE === 'true') {
  rewrites.push({
    source: '/api/v1/:path*',
    destination: `${process.env.API_SECURE ? 'https' : 'http'}://${process.env.API_HOST}/api/v1/:path*`,
  })
}

const config: NextConfig = {
  output: 'standalone',

  // does not work with GoDoxy when modifying html body
  // cacheComponents: process.env.NODE_ENV !== 'development', // Partial Pre-Rendering (Next.js 16)
  enablePrerenderSourceMaps: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  transpilePackages: ['juststore', 'juststore-shadcn'],
  rewrites: async () => rewrites,
  reactCompiler: {
    compilationMode: 'annotation',
  },
}

export default config
