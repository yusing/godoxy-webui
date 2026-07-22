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
  server: {
    allowedHosts: true,
    host: '127.0.0.1',
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tanstackStart({
      spa: isDemoSite
        ? undefined
        : {
            enabled: true,
            prerender: {
              enabled: true,
              autoSubfolderIndex: true,
              crawlLinks: true,
            },
          },
      prerender: isDemoSite
        ? undefined
        : {
            enabled: true,
            autoSubfolderIndex: true,
            autoStaticPathsDiscovery: true,
            crawlLinks: true,
            concurrency: 4,
            retryCount: 2,
            failOnError: true,
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
          path: '/docs/openapi',
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
    isDemoSite &&
      nitro({
        minify: true,
        sourcemap: false,
        preset: 'cloudflare_pages',
        cloudflare: {
          deployConfig: true,
          nodeCompat: true,
          wrangler: {
            vars: {
              API_HOST: 'demo.godoxy.dev',
              API_SECURE: 'true',
              DEMO_SITE: 'true',
            },
          },
        },
      }),
  ],
})
