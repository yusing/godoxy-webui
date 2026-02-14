/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isDemoSite = process.env.DEMO_SITE === 'true'

const config = defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    devtools(),
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
    // this is the plugin that enables path aliases
    tsconfigPaths(),
    tailwindcss(),
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
  ],
})

export default config
