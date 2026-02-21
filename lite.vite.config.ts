/// <reference types="vite/client" />
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'

const isDemoSite = process.env.DEMO_SITE === 'true'

export default defineConfig({
  plugins: [
    nitro({
      minify: true,
      sourcemap: false,
      serverDir: false,
      preset: isDemoSite ? 'cloudflare_pages' : undefined,
      cloudflare: isDemoSite
        ? {
            deployConfig: false,
            nodeCompat: true,
          }
        : undefined,
    }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: !isDemoSite,
        autoSubfolderIndex: !isDemoSite,
        autoStaticPathsDiscovery: !isDemoSite,
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
  ],
})
