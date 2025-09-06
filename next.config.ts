import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  rewrites: async () => [
    {
      source: '/wiki/:path*',
      destination: '/wiki/:path*.html',
    },
  ],
}

export default config
