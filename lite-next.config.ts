import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactCompiler: {
    compilationMode: 'annotation',
  },
}

export default config
