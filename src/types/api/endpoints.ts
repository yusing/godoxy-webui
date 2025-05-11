import { toaster } from "@/components/ui/toaster";
import { MetricsPeriod } from "./metrics/metrics";
import { AggregateType } from "./metrics/system_info";

export function buildQuery(
  query: Record<string, string | number | boolean | undefined>,
) {
  const q = new URLSearchParams();
  for (const key in query) {
    if (query[key] === undefined || query[key] === null) {
      continue;
    }
    q.set(key, query[key].toString());
  }
  if (q.size === 0) {
    return "";
  }
  return `?${q.toString()}`;
}

namespace Endpoints {
  export const fileContent = (fileType: ConfigFileType, filename: string) =>
    `/api/file/${fileType}/${encodeURIComponent(filename)}`;

  export const fileValidate = (fileType: ConfigFileType) =>
    `/api/file/validate/${fileType}`;
  export const schema = (filename: string) => `/api/schema/${filename}`;

  export const favIcon = (alias?: string, url?: string) =>
    `/api/favicon${buildQuery({ alias, url })}`;

  export const searchIcons = (keyword: string, limit: number) =>
    `/api/list/icons${buildQuery({ keyword, limit })}`;

  export const metricsSystemInfo = ({
    period,
    agent_addr,
    interval = "1s",
    aggregate,
  }: {
    period?: MetricsPeriod;
    agent_addr?: string;
    interval?: `${number}${"s" | "m" | "h"}`;
    aggregate?: AggregateType;
  } = {}) =>
    `/api/metrics/system_info${buildQuery({ period, agent_addr, interval, aggregate })}`;

  export const metricsUptime = (
    period: MetricsPeriod,
    {
      limit,
      offset,
      interval = "1s",
      keyword,
    }: {
      limit?: number;
      offset?: number;
      interval?: string;
      keyword?: string;
    } = {},
  ) =>
    `/api/metrics/uptime${buildQuery({ period, interval, limit, offset, keyword })}`;

  export const NEW_AGENT = "/api/agents/new";
  export const VERIFY_NEW_AGENT = "/api/agents/verify";

  export const AUTH = "/auth/callback";
  export const AUTH_CHECK = "/auth/check";
  export const AUTH_LOGOUT = "/auth/logout";
  export const AUTH_REDIRECT = "/auth/redirect";

  export const VERSION = "/api/version";
  export const LIST_FILES = "/api/list/files";
  export const LIST_ROUTES = "/api/list/routes";
  export const LIST_ROUTES_BY_PROVIDER = "/api/list/routes_by_provider";
  export const LIST_HOMEPAGE_CATEGORIES = "/api/list/homepage_categories";
  export const LIST_ROUTE_PROVIDERS = "/api/list/route_providers";
  export const LIST_AGENTS = "/api/agents";
  export const SEARCH_ICONS = "/api/list/icons";
  export const HOMEPAGE_CFG = "/api/list/homepage_config";

  export const STATS = "/api/stats";
  export const HEALTH = "/api/health";
  export const LOGS = "/api/logs";
  export const SET_HOMEPAGE = "/api/homepage/set";

  export const DOCKER_INFO = "/api/docker/info";
  export const DOCKER_CONTAINERS = "/api/docker/containers";
  export const DOCKER_LOGS = ({
    server,
    container,
    from,
    to,
    stdout = true,
    stderr = true,
  }: {
    server: string;
    container: string;
    from?: string;
    to?: string;
    stdout?: boolean;
    stderr?: boolean;
  }) =>
    `/api/docker/logs/${server}/${container}${buildQuery({
      from,
      to,
      stdout,
      stderr,
    })}`;
}

export type ConfigFileType = "config" | "provider" | "middleware";

type FetchArguments = {
  query?: Record<string, any>;
  headers?: HeadersInit;
  body?: BodyInit;
  signal?: AbortSignal;
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

export class FetchError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
  }

  statusLine() {
    if (this.statusText) {
      return `${this.status} - ${this.statusText}`;
    }
    return `${this.status}`;
  }
}

export function toastError<T>(error: T) {
  if (error instanceof FetchError) {
    toaster.error({
      title: `HTTP Error ${error.statusLine()}`,
      description: error.message,
    });
  } else if (error instanceof Error) {
    toaster.error({
      title: "HTTP Error",
      description: error.message,
    });
  } else if (error instanceof Event) {
    toaster.error({ title: "Websocket error" });
  } else {
    console.error(error, `unknown error type ${typeof error}`);
  }
}

export async function fetchEndpoint(
  endpoint: string,
  args: FetchArguments = {},
): Promise<Response | null> {
  if (args.query) {
    endpoint += `?${new URLSearchParams(args.query)}`;
  }

  const resp = await fetch(endpoint, {
    signal: args.signal,
    headers: args.headers,
    method: args.method,
    body: args.body,
    redirect: "error",
  });
  if (!resp.ok) {
    return Promise.reject(
      new FetchError(resp.status, resp.statusText, await resp.text()),
    );
  }
  return resp;
}

type loginProps = {
  username: string;
  password: string;
  toastAuthError?: boolean;
};

export async function login(credentials: loginProps) {
  const resp = await fetch(Endpoints.AUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!resp.ok) {
    const err = await resp.text();
    if (credentials.toastAuthError) {
      toaster.error({
        title: "Unauthorized",
        description: err,
      });
    }
    return Promise.reject(new FetchError(resp.status, resp.statusText, err));
  }
}

export default Endpoints;
