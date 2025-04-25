import Endpoints, { fetchEndpoint } from "./endpoints";
import { HealthStatusType } from "./health";
import { FileserverRoute, ReverseProxyRoute, StreamRoute } from "./route/route";

export type Column = { key: string; label: string };

export const HTTPColumns: Column[] = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "load_balancer", label: "Load Balancer" },
  { key: "url", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
  { key: "latency", label: "Latency" },
] as const;

export const StreamColumns: Column[] = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "listening", label: "Listening" },
  { key: "target", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
  { key: "latency", label: "Latency" },
] as const;

type Container = {
  container_name: string;
};

export type ReverseProxy = {
  container: string;
  alias: string;
  load_balancer?: string;
  url?: string;
  status: HealthStatusType;
  uptime: string;
  latency: string;
};

export type Stream = {
  container: string;
  alias: string;
  load_balancer?: string;
  listening: string;
  target: string;
  status: HealthStatusType;
  uptime: string;
  latency: string;
};

export async function getHTTPRoutes(signal: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_PROXIES, {
    query: { type: "http" },
    signal: signal,
  });
  if (results === null) {
    return [];
  }
  const model = (await results.json()) as Record<
    string,
    FileserverRoute | ReverseProxyRoute
  >;
  const httpRoutes: ReverseProxy[] = [];

  for (const route of Object.values(model)) {
    if (route.health && route.health.extra) {
      for (const v of Object.values(route.health.extra.pool)) {
        httpRoutes.push({
          container: route.container?.container_name ?? "",
          alias: v.name,
          load_balancer:
            route.scheme === "fileserver"
              ? undefined
              : route.health.extra.config.link,
          url: v.url,
          status: v.status as HealthStatusType,
          uptime: v.uptimeStr,
          latency: v.latencyStr,
        });
      }
    } else {
      httpRoutes.push({
        container: route.container?.container_name ?? "",
        alias: route.alias!,
        load_balancer: "",
        url: route.purl ?? (route as FileserverRoute).root,
        status: (route.health?.status as HealthStatusType) ?? "unknown",
        uptime: route.health?.uptimeStr ?? "",
        latency: route.health?.latencyStr ?? "",
      });
    }
  }

  httpRoutes.sort((a, b) => {
    return (
      a.load_balancer?.localeCompare(b.load_balancer ?? "") ??
      (a.container.localeCompare(b.container) || a.alias.localeCompare(b.alias))
    );
  });

  return httpRoutes;
}

export async function getStreamRoutes(signal: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_PROXIES, {
    query: { type: "stream" },
    signal: signal,
  });
  if (results === null) {
    return [];
  }
  const model = (await results.json()) as Record<string, StreamRoute>;
  const streams: Stream[] = [];

  for (const route of Object.values(model)) {
    streams.push({
      container: route.idlewatcher?.container_name ?? "",
      alias: route.alias!,
      listening: `${route.scheme}://:${route.port.listening}`,
      target: route.health?.url ?? route.purl!,
      status: (route.health?.status as HealthStatusType) ?? "unknown",
      uptime: route.health?.uptimeStr ?? "",
      latency: route.health?.latencyStr ?? "",
    });
  }

  streams.sort((a, b) => {
    return (
      a.container.localeCompare(b.container) || a.alias.localeCompare(b.alias)
    );
  });

  return streams;
}
