import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  rewrites: async () => [
    {
      source: '/wiki/:path*',
      destination: '/wiki/:path*.html',
    },
  ],
  experimental: {
    reactCompiler: {
      compilationMode: 'annotation',
    },
  },
}

export default config
