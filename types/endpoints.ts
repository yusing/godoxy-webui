
namespace Endpoints {
  export const FileContent = (filename: string) => `/file/${filename}`;
  export const Schema = (filename: string) => `/schema/${filename}`;
  export const VERSION = "/version";
  export const LOGIN = "/login";
  export const LOGOUT = "/logout";
  export const LIST_CONFIG_FILES = "/list/config_files";
  export const LIST_PROXIES = "/list/routes";
  export const MATCH_DOMAINS = "/list/match_domains";
  export const HOMEPAGE_CFG = "/list/homepage_config";

  export const STATS = `/stats/ws`;
}

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
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return `${error.status} - ${error.statusText}\n${error.content}`;
  }
}

export async function fetchEndpoint(
  endpoint: string,
  args: FetchArguments = {},
) {
  // see proxy in vite.config.ts
  endpoint = `/api${endpoint}`;
  if (args.query) {
    endpoint += `?${new URLSearchParams(args.query)}`;
  }

  return await fetch(endpoint, {
    signal: args.signal,
    headers: args.headers,
    method: args.method,
    body: args.body,
  });
}

export function ws(endpoint: string) {
  return new WebSocket(`/api${endpoint}`);
}

export async function checkResponse(resp: Response) {
  if (!resp.ok) {
    throw new FetchError({
      status: resp.status,
      statusText: resp.statusText,
      content: await resp.text(),
    });
  }
}
export default Endpoints;
