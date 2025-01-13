import { StatusCodes } from "http-status-codes";
import log from "loglevel";

namespace Endpoints {
  export const FileContent = (fileType: FileType, filename: string) =>
    `/api/file/${fileType}/${filename}`;
  export const Schema = (filename: string) => `/api/schema/${filename}`;
  export const FavIcon = (alias: string) => `/api/favicon/${alias}`;

  export const VERSION = "/api/version";
  export const AUTH = "/api/auth/callback";
  export const AUTH_LOGOUT = "/api/auth/logout";
  export const AUTH_REDIRECT = "/api/auth/redirect";
  export const LIST_FILES = "/api/list/files";
  export const LIST_PROXIES = "/api/list/routes";
  export const MATCH_DOMAINS = "/api/list/match_domains";
  export const HOMEPAGE_CFG = "/api/list/homepage_config";

  export const STATS = "/api/stats/ws";
}

export type FileType = "config" | "provider" | "middleware";

type FetchArguments = {
  query?: Record<string, any>;
  headers?: HeadersInit;
  body?: BodyInit;
  signal?: AbortSignal;
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

export class FetchError {
  status: number;
  statusText: string;
  content: string;

  constructor(args: { status: number; statusText: string; content: string }) {
    this.status = args.status;
    this.statusText = args.statusText;
    this.content = args.content;
  }
}

export function formatError(error: string | Error | FetchError) {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return `${error.status} - ${error.statusText}\n${error.content}`;
}

export async function fetchEndpoint(
  endpoint: string,
  args: FetchArguments = {}
) {
  if (args.query) {
    endpoint += `?${new URLSearchParams(args.query)}`;
  }

  const resp = await fetch(endpoint, {
    signal: args.signal,
    headers: args.headers,
    method: args.method,
    body: args.body,
  });
  if (!resp.ok) {
    if (
      resp.status === StatusCodes.FORBIDDEN ||
      resp.status === StatusCodes.UNAUTHORIZED
    ) {
      log.info("Unauthorized, redirecting to auth page");

      window.location.href = Endpoints.AUTH_REDIRECT;
    }
    throw new FetchError({
      status: resp.status,
      statusText: resp.statusText,
      content: await resp.text(),
    });
  }

  return resp;
}

export function ws(endpoint: string) {
  return new WebSocket(`${endpoint}`);
}

export default Endpoints;
