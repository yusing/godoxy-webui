import type { RouteKey } from './store'

function encodeRouteKey(key: string): RouteKey {
  return key.replaceAll('.', '*') as RouteKey
}

function decodeRouteKey(key: RouteKey): string {
  return key.replaceAll('*', '.')
}

export { decodeRouteKey, encodeRouteKey }
