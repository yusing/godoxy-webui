/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import { siteConfig } from '@/site-config'

const isDemoSite = process.env.DEMO_SITE === 'true'

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ['juststore'],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tsconfigPaths(),
    nitro({
      preset: isDemoSite ? 'cloudflare_pages' : 'bun',
      minify: true,
      sourcemap: false,
      cloudflare: isDemoSite
        ? {
            deployConfig: true,
            nodeCompat: true,
          }
        : undefined,
    }),
    tanstackStart(),
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
    pwaConfig('.output/public'),
    pwaConfig('.output/server'),
  ],
})

function pwaConfig(outdir: string) {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-icon.png'],
    outDir: outdir,
    workbox: {
      navigateFallback: null,
    },
    manifest: {
      name: siteConfig.metadata.title,
      short_name: siteConfig.metadata.title,
      description: siteConfig.metadata.description,
      start_url: '/',
      icons: [
        {
          src: '/web-app-manifest-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/web-app-manifest-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      theme_color: '#fffbfb',
      background_color: '#000000',
      display: 'standalone',
    },
  })
}
