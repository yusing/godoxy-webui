'use client'

import { useFragment } from '@/hooks/fragment'
import type { RouteUptimeAggregate } from '@/lib/api'
import { createStore } from 'juststore'

export type RouteDisplaySettings = {
  dockerOnly: boolean
  hideUnknown: boolean
  hideUptimebar: boolean
}

export type RouteKey = string & { __brand: 'RouteKey' }

type RouteState = {
  requestedRoute: RouteKey | undefined
  routeKeys: RouteKey[]
  uptime: Record<RouteKey, RouteUptimeAggregate>
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

export function useSelectedRoute(): RouteKey {
  const requestedRoute = store.requestedRoute.use()
  const fragment = useFragment() as RouteKey | undefined
  return fragment || requestedRoute || ('' as RouteKey)
}

// setSelectedRoute changes the active route item in the sidebar
export function setSelectedRoute(key: RouteKey) {
  const prevActive = document.querySelector('.route-item[data-active="true"]') as HTMLElement | null
  if (prevActive) {
    prevActive.removeAttribute('data-active')
  }

  const el = document.getElementById(`route-${key}`)
  if (el) el.setAttribute('data-active', 'true')

  window.location.hash = `#${key}`
}
