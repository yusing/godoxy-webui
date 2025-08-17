import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Default to localhost:8888 if env var is not set
const API_BASE_URL = `http://${process.env.GODOXY_API_ADDR ?? "127.0.0.1:8888"}`;

export function middleware(request: NextRequest) {
  // add /api/v1 prefix if needed
  let apiPath = request.nextUrl.pathname;
  if (!apiPath.startsWith("/api/v1")) {
    apiPath = "/api/v1" + apiPath;
  }
  // Create the URL for the proxied request
  const url = new URL(apiPath, API_BASE_URL);

  // Preserve query parameters
  url.search = request.nextUrl.search;

  // Return rewritten URL response
  let proto = "http";
  if (request.nextUrl.protocol === "https:") {
    proto = "https";
  }
  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-Host", request.nextUrl.host);
  headers.set("X-Forwarded-Proto", proto);
  headers.set("Origin", request.nextUrl.origin);

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
