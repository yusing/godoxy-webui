/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const PRESET = process.env.PRESET ?? 'bun'

const config = defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    devtools(),
    nitro({
      preset: PRESET,
      minify: true,
      sourcemap: false,
    }),
    // this is the plugin that enables path aliases
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
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
