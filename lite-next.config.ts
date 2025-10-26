import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // uncomment this when https://github.com/oven-sh/bun/issues/23554 is fixed
  // reactCompiler: true,
}

export default config
