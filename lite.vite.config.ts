/// <reference types="vite/client" />

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const isDemoSite = process.env.DEMO_SITE === 'true'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tanstackStart({
      prerender: isDemoSite
        ? undefined
        : {
            enabled: true,
            autoSubfolderIndex: true,
            autoStaticPathsDiscovery: true,
            crawlLinks: true,
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
      minify: true,
      sourcemap: false,
      serverDir: false,
      preset: isDemoSite ? 'cloudflare_pages' : undefined,
      cloudflare: isDemoSite
        ? {
            deployConfig: true,
            nodeCompat: true,
            wrangler: {
              vars: {
                API_HOST: 'demo.godoxy.dev',
                API_SECURE: 'true',
                DEMO_SITE: 'true',
              },
            },
          }
        : undefined,
    }),
  ],
})
