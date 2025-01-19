import Endpoints, { fetchEndpoint } from "./endpoints";
import type { HTTPRoute } from "./route/http";
import type { StreamRoute } from "./route/stream";

export type Column = { key: string; label: string };

export const ReverseProxyColumns = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "load_balancer", label: "Load Balancer" },
  { key: "url", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
  { key: "latency", label: "Latency" },
];

export const StreamColumns = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "listening", label: "Listening" },
  { key: "target", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
  { key: "latency", label: "Latency" },
];

export async function getReverseProxies(signal: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_PROXIES, {
    query: { type: "reverse_proxy" },
    signal: signal,
  });
  const model = (await results.json()) as Record<string, HTTPRoute>;
  const reverseProxies: any[] = [];

  for (const route of Object.values(model)) {
    if (route.health && route.health.extra) {
      for (const v of Object.values(route.health.extra.pool)) {
        reverseProxies.push({
          container: "",
          alias: v.name,
          load_balancer: route.raw.alias,
          url: v.url,
          status: v.status,
          uptime: v.uptimeStr,
          latency: v.latencyStr,
        });
      }
    } else {
      reverseProxies.push({
        container: route.idlewatcher?.container_name ?? "",
        alias: route.raw.alias,
        load_balancer: "",
        url: route.health?.url ?? route.url ?? "",
        status: route.health?.status ?? "unknown",
        uptime: route.health?.uptimeStr ?? "",
        latency: route.health?.latencyStr ?? "",
      });
    }
  }

  reverseProxies.sort((a, b) => {
    return (
      a.load_balancer.localeCompare(b.load_balancer) ||
      a.container.localeCompare(b.container) ||
      a.alias.localeCompare(b.alias)
    );
  });

  return reverseProxies;
}

export async function getStreams(signal: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_PROXIES, {
    query: { type: "stream" },
    signal: signal,
  });
  const model = (await results.json()) as Record<string, StreamRoute>;
  const streams: any[] = [];

  for (const route of Object.values(model)) {
    streams.push({
      container: route.idlewatcher?.container_name ?? "",
      alias: route.raw.alias,
      listening: `${route.scheme.listening}://:${route.port.listening}`,
      target: route.health?.url ?? route.url,
      status: route.health?.status ?? "unknown",
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
