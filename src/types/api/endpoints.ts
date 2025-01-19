import { useAuth } from "@/components/auth";
import { toaster } from "@/components/ui/toaster";
import { StatusCodes } from "http-status-codes";

namespace Endpoints {
  export const FileContent = (fileType: ConfigFileType, filename: string) =>
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
  export const HEALTH = "/api/health/ws";
  export const LOGS = "/api/logs/ws";
}

export type ConfigFileType = "config" | "provider" | "middleware";

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

  constructor(status: number, statusText: string, content: string) {
    this.status = status;
    this.statusText = statusText;
    this.content = content;
  }
}

export function toastError(error: Error | FetchError) {
  if (error instanceof FetchError) {
    toaster.error({
      title: `Fetch error ${error.status} - ${error.statusText}`,
      description: error.content,
    });
    return;
  }
  if (error.cause instanceof FetchError) {
    toaster.error({
      title: `Fetch error ${error.cause.status} - ${error.cause.statusText}`,
      description: error.cause.content,
    });
  } else {
    toaster.error({
      title: "Fetch error",
      description: error.message,
    });
  }
}

export async function fetchEndpoint(
  endpoint: string,
  args: FetchArguments = {},
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
      toaster.error({
        title: "Unauthorized",
        description: "You are not logged in",
      });
      const [, setAuthed] = useAuth();
      setAuthed(false);
      window.location.href = Endpoints.AUTH_REDIRECT;
    }
    return Promise.reject(
      new Error("Fetch error", {
        cause: new FetchError(resp.status, resp.statusText, await resp.text()),
      }),
    );
  }
  return resp;
}

export function ws(endpoint: string) {
  return new WebSocket(`${endpoint}`);
}

export default Endpoints;
