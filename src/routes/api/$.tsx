import { createFileRoute } from '@tanstack/react-router'

// This route is used to proxy API requests to the GoDoxy API
//
// This is for demo site deployment only, GoDoxy will handle API request in self hosted version itself.
export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const url = new URL(request.url)
        const targetUrl = new URL(import.meta.env.VITE_API_URL)
        targetUrl.pathname = url.pathname
        targetUrl.search = url.search

        return fetch(targetUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        })
      },
    },
  },
})
