import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? "127.0.0.1:8888"}`;

class HeadersWithHost extends Headers {
  host: string;

  constructor(init?: Headers, host?: string) {
    super({});
    init?.forEach((value, key) => {
      this.set(key, value);
    });
    this.host = host ?? "";
  }
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/users)
  const pathname = request.nextUrl.pathname;

  // Check if it's an API route
  if (pathname.startsWith("/api/")) {
    // Remove the /api prefix and add v1 instead
    const apiPath = pathname.replace(/^\/api/, "/v1");
    // Create the URL for the proxied request
    const url = new URL(apiPath, API_BASE_URL);

    // Preserve query parameters
    url.search = request.nextUrl.search;

    // Return rewritten URL response
    return NextResponse.rewrite(url, {
      headers: new HeadersWithHost(request.headers, request.nextUrl.host),
    });
  }

  if (pathname.startsWith("/docs/images/")) {
    return NextResponse.redirect(
      request.nextUrl.origin + "/wiki" + pathname.slice("/docs".length),
    );
  }
}

// Configure matcher for paths that trigger this middleware
export const config = {
  matcher: ["/api/:path*", "/docs/:path*"],
};
