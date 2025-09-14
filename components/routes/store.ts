'use client'

import type { RouteUptimeAggregate } from '@/lib/api'
import { useFragment } from '../../hooks/fragment'
import { createStore } from '../../hooks/store'

export type RouteDisplaySettings = {
  dockerOnly: boolean
  hideUnknown: boolean
  hideUptimebar: boolean
}

type RouteState = {
  requestedRoute: string | undefined
  routeKeys: string[]
  uptime: Record<string, RouteUptimeAggregate>
  displaySettings: RouteDisplaySettings
  logsAutoScroll: boolean
  mobileDialogOpen: boolean
}

export const store = createStore<RouteState>('routes', {
  requestedRoute: undefined,
  routeKeys: [],
  uptime: {},
  displaySettings: {
    dockerOnly: false,
    hideUnknown: false,
    hideUptimebar: false,
  },
  logsAutoScroll: true,
  mobileDialogOpen: false,
})

export function useSelectedRoute(): string | undefined {
  const requestedRoute = store.requestedRoute.use()
  const fragment = useFragment()
  return fragment || requestedRoute
}

// setSelectedRoute changes the active route item in the sidebar
export function setSelectedRoute(alias: string) {
  const prevActive = document.querySelector('.route-item[data-active="true"]') as HTMLElement | null
  if (prevActive) {
    prevActive.removeAttribute('data-active')
  }

  const el = document.getElementById(`route-${alias}`)
  if (el) el.setAttribute('data-active', 'true')

  window.location.hash = `#${alias}`
}
