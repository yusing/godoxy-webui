import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import { store } from '../store'

export default function RoutesDetailProvider() {
  useWebSocketApi<Route[]>({
    endpoint: '/route/list',
    onMessage: data => {
      store.routeDetails.set(
        data.reduce(
          (acc, route) => {
            acc[route.alias] = route
            return acc
          },
          {} as Record<string, Route>
        )
      )
    },
  })
  return null
}
