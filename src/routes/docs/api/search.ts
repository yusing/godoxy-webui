import { createFileRoute } from '@tanstack/react-router'
import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/wiki/source'

const server = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
})

export const Route = createFileRoute('/docs/api/search')({
  server: {
    handlers: {
      GET: () => server.staticGET(),
    },
  },
})
