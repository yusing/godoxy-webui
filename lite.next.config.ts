import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    reactCompiler: {
      compilationMode: 'annotation',
    },
  },
}

export default config
