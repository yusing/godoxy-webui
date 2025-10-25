import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  cacheComponents: true, // Partial Pre-Rendering (Next.js 16)
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
}

export default config
