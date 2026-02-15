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
            deployConfig: true,
            nodeCompat: true,
          }
        : undefined,
    }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(isDemoSite ? undefined : {
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
  ],
})
