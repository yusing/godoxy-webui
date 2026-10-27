import { useWebSocketApi } from '@/hooks/websocket'
import type { RouteWithPublicURLs as Route } from '@/lib/api'
import { store } from '../store'

export default function RoutesDetailProvider() {
  useWebSocketApi<Route[]>({
    endpoint: '/route/list',
    onMessage: data => {
      store.routeDetails.set(Object.fromEntries(data.map(route => [route.alias, route])))
    },
  })
  return null
}
