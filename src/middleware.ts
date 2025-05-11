import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? "127.0.0.1:8888"}`;

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/users)
  const pathname = request.nextUrl.pathname;

  // Remove the /api prefix and add v1 instead
  let apiPath = pathname.replace(/^\/api/, "/v1");
  if (!apiPath.startsWith("/v1")) {
    apiPath = "/v1" + apiPath;
  }
  // Create the URL for the proxied request
  const url = new URL(apiPath, API_BASE_URL);

  // Preserve query parameters
  url.search = request.nextUrl.search;

  // Return rewritten URL response
  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-Host", request.nextUrl.host);

  return NextResponse.rewrite(url, {
    request: {
      headers: headers,
    },
  });
}

// Configure matcher for paths that trigger this middleware
export const config = {
  matcher: ["/api/:path*", "/auth/:path*", "/v1/:path*"],
};
