import Endpoints, { fetchEndpoint } from "./endpoints";
import { RouteResponse } from "./route/route";

export function toColumnName(key: string) {
  const snakes = key.split("_");
  return snakes
    .map((snake) => snake.charAt(0).toUpperCase() + snake.slice(1))
    .join(" ");
}

export async function getRoutes(provider: string, signal?: AbortSignal) {
  const results = await fetchEndpoint(Endpoints.LIST_ROUTES, {
    query: { provider: provider },
    signal: signal,
  });
  if (results === null) {
    return [];
  }
  return (await results.json()) as RouteResponse[] | null;
}
