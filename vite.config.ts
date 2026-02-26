/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const PRESET = process.env.PRESET ?? 'bun'
const DEBUG_BUILD = ['1', 'true'].includes(process.env.DEBUG_BUILD ?? '')

const config = defineConfig({
  server: {
    allowedHosts: true,
  },
  build: {
    minify: !DEBUG_BUILD,
    sourcemap: DEBUG_BUILD,
  },
  plugins: [
    mdx(await import('./source.config')),
    devtools(),
    // this is the plugin that enables path aliases
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
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
    viteReact({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              compilationMode: 'annotation',
            },
          ],
        ],
      },
    }),
    nitro({
      preset: PRESET,
      minify: !DEBUG_BUILD,
      sourcemap: DEBUG_BUILD,
    }),
  ],
})

export default config
