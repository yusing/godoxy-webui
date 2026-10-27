import { expect, mock, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { tanstackStart } from '@tanstack/react-start/plugin/vite'

let options: NonNullable<Parameters<typeof tanstackStart>[0]>
mock.module('@tanstack/react-start/plugin/vite', () => ({
  tanstackStart: (value: typeof options) => {
    options = value
    return []
  },
}))
await import('../vite.config')

const prerenderModule = new URL(
  './dist/esm/prerender.js',
  import.meta.resolve('@tanstack/start-plugin-core/package.json')
).href

test('prerender failures terminate the build runtime', () => {
  const result = Bun.spawnSync([
    'node',
    '--input-type=module',
    '-e',
    `
    import { prerender } from ${JSON.stringify(prerenderModule)};
    await prerender({
      startConfig: ${JSON.stringify({ router: {}, prerender: options.prerender, pages: [{ path: '/missing' }] })},
      handler: { getClientOutputDirectory: () => '.', request: async () => new Response('', { status: 404 }) }
    });
  `,
  ])
  expect(result.exitCode).not.toBe(0)
  expect(result.stderr.toString()).toContain('Failed to fetch /missing')
})

test('raw MDX pages remain available without crawling sample HTML', () => {
  const page = options.pages?.find(page => page.path.startsWith('/llms.mdx/'))
  expect(page).toBeDefined()
  expect(options.pages?.some(page => page.path === '/docs/godoxy')).toBe(false)
  const output = mkdtempSync(join(tmpdir(), 'godoxy-prerender-'))
  try {
    const result = Bun.spawnSync([
      'node',
      '--input-type=module',
      '-e',
      `
      import { prerender } from ${JSON.stringify(prerenderModule)};
      const paths = [];
      await prerender({
        startConfig: ${JSON.stringify({ router: {}, prerender: options.prerender, pages: [page] })},
        handler: {
          getClientOutputDirectory: () => ${JSON.stringify(output)},
          request: async path => {
            paths.push(path);
            return new Response('<a href="/contact">Example</a>', { headers: { 'content-type': 'text/markdown' } });
          }
        }
      });
      if (paths.length !== 1) throw new Error('Crawled a raw-MDX example');
    `,
    ])
    expect(result.exitCode).toBe(0)
  } finally {
    rmSync(output, { recursive: true, force: true })
  }
})
