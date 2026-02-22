/// <reference types="vite/client" />
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isDemoSite = process.env.DEMO_SITE === 'true'

export default defineConfig({
  plugins: [
    mdx(await import('./source.config')),
    tsconfigPaths(),
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
