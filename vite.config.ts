/// <reference types="vite/client" />

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const PRESET = process.env.PRESET
const production = process.env.NODE_ENV === 'production'

console.log(process.env.NODE_ENV, production)

const config = defineConfig({
  server: {
    allowedHosts: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        failOnError: false,
        filter: ({ path }) => !path.startsWith('/api/'),
      },
      pages: [
        {
          path: '/docs',
        },
        {
          path: '/docs/godoxy',
        },
        {
          path: '/docs/impl',
        },
        {
          path: '/docs/api/search',
        },
      ],
    }),
    viteReact(),
    babel({
      presets: [
        reactCompilerPreset({
          compilationMode: 'annotation',
          target: '19',
        }),
      ],
    }),
    nitro({
      preset: PRESET,
      minify: production,
      sourcemap: !production,
    }),
  ],
})

export default config
