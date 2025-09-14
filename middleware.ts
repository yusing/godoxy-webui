import { HttpStatusCode } from 'axios'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? '127.0.0.1:8888'}`

function extractHeaders(requestHeaders: Headers, headerNames: string[]) {
  const result: Record<string, string> = {}
  for (const headerName of headerNames) {
    const headerValue =
      requestHeaders.get(headerName) || requestHeaders.get(headerName.toLowerCase())
    if (headerValue) {
      result[headerName] = headerValue
    }
  }
  return result
}

export async function middleware(request: NextRequest) {
  const requestHeaders = extractHeaders(request.headers, [
    'Cookie',
    'X-Forwarded-Host',
    'X-Forwarded-Proto',
    'Origin',
    // WebSocket-specific headers
    'Connection',
    'Upgrade',
    'Sec-WebSocket-Key',
    'Sec-WebSocket-Version',
    'Sec-WebSocket-Protocol',
    'Sec-WebSocket-Extensions',
  ])

  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next({
      headers: requestHeaders,
    })
  }

  // Return rewritten URL response
  let proto = 'http'
  if (request.nextUrl.protocol === 'https:') {
    proto = 'https'
  }

  if (!requestHeaders['X-Forwarded-Host']) {
    requestHeaders['X-Forwarded-Host'] = request.nextUrl.host
    requestHeaders['X-Forwarded-Proto'] = proto
  }

  requestHeaders['Origin'] = requestHeaders['X-Forwarded-Host']

  if (request.nextUrl.pathname.startsWith('/auth/')) {
    request.nextUrl.pathname = `/api/v1${request.nextUrl.pathname}`
  }

  if (
    request.nextUrl.pathname !== '/api/v1/auth/callback' &&
    request.nextUrl.pathname !== '/api/v1/version'
  ) {
    const resp = await fetch(new URL('/api/v1/auth/check', API_BASE_URL), {
      method: 'HEAD',
      headers: requestHeaders,
      redirect: 'manual',
      cache: 'no-store',
    }).catch(e => {
      console.log('error', e)
      return new Response(
        JSON.stringify({
          error: e.message,
          cause: e.cause,
          stack: process.env.NODE_ENV === 'development' ? e.stack : undefined,
        }),
        {
          status: HttpStatusCode.InternalServerError,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    })

    if (resp.status === HttpStatusCode.InternalServerError) {
      return new NextResponse(await resp.text(), {
        status: HttpStatusCode.InternalServerError,
        headers: resp.headers,
      })
    }

    if (resp.status === HttpStatusCode.Unauthorized || resp.status === HttpStatusCode.Forbidden) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin), {
        headers: resp.headers,
      })
    }

    if (
      resp.status === HttpStatusCode.Found ||
      resp.status === HttpStatusCode.TemporaryRedirect ||
      resp.status === HttpStatusCode.PermanentRedirect
    ) {
      let location = resp.headers.get('Location') ?? '/login'
      if (!location?.startsWith('http://') && !location?.startsWith('https://')) {
        location = new URL(
          location,
          `${request.nextUrl.protocol}//${requestHeaders['X-Forwarded-Host']}`
        ).toString()
      }
      return NextResponse.redirect(location, {
        headers: resp.headers,
      })
    }
  }

  // match api requests only
  const apiPath = request.nextUrl.pathname
  if (!apiPath.startsWith('/api/v1')) {
    return NextResponse.next({
      headers: requestHeaders,
    })
  }
  // Create the URL for the proxied request
  const url = new URL(apiPath, API_BASE_URL)

  // Preserve query parameters
  url.search = request.nextUrl.search

  return NextResponse.rewrite(url, {
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
