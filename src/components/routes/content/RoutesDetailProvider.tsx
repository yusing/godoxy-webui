import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import { type RouteKey, store } from '../store'
import { encodeRouteKey } from '../utils'

export default function RoutesDetailProvider() {
  useWebSocketApi<Route[]>({
    endpoint: '/route/list',
    onMessage: data => {
      store.routeDetails.set(
        data.reduce(
          (acc, route) => {
            acc[encodeRouteKey(route.alias)] = route
            return acc
          },
          {} as Record<RouteKey, Route>
        )
      )
    },
  })
  return null
}
