/// <reference types="vite/client" />

import { globSync } from 'node:fs'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { getSlugs } from 'fumadocs-core/source'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const isDemoSite = process.env.DEMO_SITE === 'true'
const sourceConfig = await import('./source.config.ts')
const docSlugs = globSync('**/*.{md,mdx}', {
  cwd: new URL(`${sourceConfig.docs.dir}/`, import.meta.url),
})
  .toSorted()
  .map(path => getSlugs(path.replaceAll('\\', '/')))

export default defineConfig({
  server: {
    allowedHosts: true,
    host: '127.0.0.1',
  },
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // Bundle packages whose Node entry points cannot be used directly for SSR.
    noExternal: ['juststore', 'codemirror-json-schema-refined', '@xterm/xterm'],
  },
  plugins: [
    mdx(sourceConfig),
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
            // Retries skip already-seen paths in the current prerenderer, hiding failures.
            retryCount: 0,
            failOnError: true,
            filter: ({ path }) => !path.startsWith('/api/'),
          },
      pages: [
        {
          path: '/docs',
        },
        ...docSlugs.flatMap(slugs => [
          { path: `/${['docs', ...slugs].join('/')}` },
          {
            path: `/llms.mdx/docs/${[...slugs, 'index.mdx'].join('/')}`,
            // Markdown contains example anchors, not rendered navigation links.
            prerender: { crawlLinks: false },
          },
        ]),
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
