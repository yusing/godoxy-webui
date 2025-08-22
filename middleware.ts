import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? '127.0.0.1:8888'}`

export function middleware(request: NextRequest) {
  // pass url info to ssr components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-path', request.nextUrl.pathname)
  requestHeaders.set('x-url', request.url)

  // match api requests only
  let apiPath = request.nextUrl.pathname
  if (!apiPath.startsWith('/api/v1')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  // Create the URL for the proxied request
  const url = new URL(apiPath, API_BASE_URL)

  // Preserve query parameters
  url.search = request.nextUrl.search

  // Return rewritten URL response
  let proto = 'http'
  if (request.nextUrl.protocol === 'https:') {
    proto = 'https'
  }
  requestHeaders.set('X-Forwarded-Host', request.nextUrl.host)
  requestHeaders.set('X-Forwarded-Proto', proto)
  requestHeaders.set('Origin', request.nextUrl.origin)

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  })
}
