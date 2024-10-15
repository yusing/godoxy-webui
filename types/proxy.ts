import Endpoints, { fetchEndpoint } from "./endpoints";

type ProxyEntriesObject = Record<string, ReverseProxy>;
export type ReverseProxy = Record<string, any>;
export type Stream = Record<string, any>;
export type LoadBalancedRoute = Record<string, any>;
export type Column = { key: string; label: string };

export const ReverseProxyColumns = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "load_balancer", label: "Load Balancer" },
  { key: "url", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
];

export const StreamColumns = [
  { key: "container", label: "Container" },
  { key: "alias", label: "Alias" },
  { key: "listening", label: "Listening" },
  { key: "target", label: "Target" },
  { key: "status", label: "Status" },
  { key: "uptime", label: "Uptime" },
];

export async function getReverseProxies(signal: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_PROXIES, {
    query: { type: "reverse_proxy" },
    signal: signal,
  });
  const model = (await results.json()) as ProxyEntriesObject;
  const reverseProxies: ReverseProxy[] = [];

  for (const route of Object.values(model)) {
    let entry = route.raw;

    reverseProxies.push({
      container: entry.container ? entry.container.container_name : "",
      alias: route.alias,
      load_balancer: "",
      url: route.health ? route.health.url : entry.url ? entry.url : "",
      status: route.health ? route.health.status : "unknown",
      uptime: route.health ? route.health.uptimeStr : "",
    });

    if (route.health && route.health.extra) {
      for (const v of Object.values(
        route.health.extra.pool as LoadBalancedRoute,
      )) {
        reverseProxies.push({
          container: "",
          alias: v.name,
          load_balancer: route.alias,
          url: v.url,
          status: v.status,
          uptime: v.uptimeStr,
        });
      }
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
  const model = (await results.json()) as ProxyEntriesObject;
  const streams: Stream[] = [];

  for (const route of Object.values(model)) {
    let entry = route.raw;

    streams.push({
      container: entry.container ? entry.container.container_name : "",
      alias: route.alias,
      listening: `${route.scheme.listening}://:${route.port.listening}`,
      target: route.health
        ? route.health.url
        : `${route.scheme.proxy}://${route.host}:${route.port.proxy}`,
      status: route.health ? route.health.status : "unknown",
      uptime: route.health ? route.health.uptimeStr : "",
    });
  }

  streams.sort((a, b) => {
    return (
      a.container.localeCompare(b.container) || a.alias.localeCompare(b.alias)
    );
  });

  return streams;
}
