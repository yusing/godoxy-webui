import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Default to localhost:8888 if env var is not set
const API_BASE_URL = process.env.GODOXY_API_ADDR || 'http://127.0.0.1:8888'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/users)
  const pathname = request.nextUrl.pathname

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // Remove the /api prefix and add v1 instead
    const apiPath = pathname.replace(/^\/api/, '/v1')
    // Create the URL for the proxied request
    const url = new URL(apiPath, API_BASE_URL)
    
    // Preserve query parameters
    url.search = request.nextUrl.search
        
    // Return rewritten URL response
    return NextResponse.rewrite(url)
  }
}

// Configure matcher for paths that trigger this middleware
export const config = {
  matcher: '/api/:path*',
}
