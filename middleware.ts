import { HttpStatusCode } from 'axios'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? '127.0.0.1:8888'}`

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next({
      headers: requestHeaders,
    })
  }

  if (request.nextUrl.pathname === '/logout') {
    return new NextResponse(
      null,
      await fetch(new URL('/api/v1/auth/logout', API_BASE_URL), {
        method: 'POST',
      })
    )
  }

  // FIXME: being redirected to login again with invalid cookie
  if (request.nextUrl.pathname !== '/api/v1/auth/callback') {
    const cookie = request.headers.get('Cookie')
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin), {
        headers: requestHeaders,
      })
    }

    const resp = await fetch(new URL('/api/v1/auth/check', API_BASE_URL), {
      method: 'HEAD',
      headers: { Cookie: cookie },
      redirect: 'manual',
      cache: 'no-store',
    }).catch(() => new Response('Unauthorized', { status: HttpStatusCode.Unauthorized }))

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
      return NextResponse.redirect(
        resp.headers.get('Location') ||
          resp.headers.get('X-Redirect-To') ||
          new URL('/login', request.nextUrl.origin),
        {
          headers: resp.headers,
        }
      )
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
