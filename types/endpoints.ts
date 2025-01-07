namespace Endpoints {
  export const FileContent = (fileType: FileType, filename: string) =>
    `/file/${fileType}/${filename}`;
  export const Schema = (filename: string) => `/schema/${filename}`;
  export const VERSION = "/version";
  export const LOGIN = "/login";
  export const LOGOUT = "/logout";
  export const LIST_FILES = "/list/files";
  export const LIST_PROXIES = "/list/routes";
  export const MATCH_DOMAINS = "/list/match_domains";
  export const HOMEPAGE_CFG = "/list/homepage_config";

  export const STATS = `/stats/ws`;
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
  endpoint = `/api${endpoint}`;
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
    throw new FetchError({
      status: resp.status,
      statusText: resp.statusText,
      content: await resp.text(),
    });
  }

  return resp;
}

export function ws(endpoint: string) {
  return new WebSocket(`/api${endpoint}`);
}

export default Endpoints;
