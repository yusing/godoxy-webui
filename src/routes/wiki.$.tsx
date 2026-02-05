import { extname, join, sep } from 'node:path'
import { createFileRoute } from '@tanstack/react-router'

function isSafe(pathSegs: string[]): boolean {
  return !pathSegs.some(seg => seg === '..')
}

export const Route = createFileRoute('/wiki/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // decodeURLComponent to resolve %2e path traversal
        let pathSegs = decodeURIComponent(new URL(request.url).pathname)
          .slice('/wiki'.length)
          .split(sep)

        if (!isSafe(pathSegs)) {
          return new Response('Forbidden', { status: 403 })
        }

        let fileName = pathSegs.at(-1)
        if (!fileName) {
          pathSegs = []
          fileName = 'index.html'
        } else {
          pathSegs.pop()
          if (!extname(fileName)) {
            fileName = `${fileName}.html`
          }
        }
        const fullPath = join('public', 'wiki', ...pathSegs, fileName)
        const file = Bun.file(fullPath)
        if (await file.exists()) {
          return new Response(await file.bytes(), {
            headers: {
              'Content-Type': file.type,
            },
          })
        }
        return new Response(`${fullPath} not found`, { status: 404 })
      },
    },
  },
})
