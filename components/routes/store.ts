import type { RouteUptimeAggregate } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { useFragment } from '../../hooks/fragment'
import { createStore } from '../../hooks/store'

export type RouteDisplaySettings = {
  dockerOnly: boolean
  hideUnknown: boolean
  hideUptimebar: boolean
}

type RouteState = {
  routeKeys: string[]
  uptime: Record<string, RouteUptimeAggregate>
  displaySettings: RouteDisplaySettings
  logsAutoScroll: boolean
}

export const store = createStore<RouteState>('routes', {
  routeKeys: [],
  uptime: {},
  displaySettings: {
    dockerOnly: false,
    hideUnknown: false,
    hideUptimebar: false,
  },
  logsAutoScroll: true,
})

export function useSelectedRoute(): string | null {
  const params = useSearchParams()
  const fragment = useFragment()
  if (fragment) {
    return fragment
  }
  return params.get('route')
}

// setSelectedRoute changes the active route item in the sidebar
export function setSelectedRoute(alias: string) {
  // css trick to prevent the whole route list from being re-rendered on selection change
  // since the item itself no longer needs to check it's own active state with useSelectedRoute

  const prevActive = document.querySelector('.route-item[data-active="true"]') as HTMLElement | null
  if (prevActive) {
    prevActive.removeAttribute('data-active')
  }

  const el = document.getElementById(`route-${alias}`)
  if (el) el.setAttribute('data-active', 'true')

  window.location.hash = `#${alias}`
  if (window.location.search.includes('route=')) {
    window.location.search = ''
  }
}
