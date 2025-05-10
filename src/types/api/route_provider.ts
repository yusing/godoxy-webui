import Endpoints from "./endpoints";

export enum ProviderType {
  docker = "docker",
  file = "file",
  agent = "agent",
}

export type RouteProviderResponse = {
  short_name: string;
  full_name: string;
};

export function getRouteProviders() {
  return fetch(Endpoints.LIST_ROUTE_PROVIDERS)
    .then((res) => res.json())
    .then((res) => res as RouteProviderResponse[]);
}
