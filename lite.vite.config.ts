/// <reference types="vite/client" />
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'
import { siteConfig } from '@/site-config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ['juststore'],
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    nitro({
      minify: true,
      sourcemap: false,
      serverDir: false,
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: false,
      },
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
    }})
}