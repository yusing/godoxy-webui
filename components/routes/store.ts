'use client'

import { useFragment } from '@/hooks/fragment'
import type { ProxmoxNodeStats, RouteRoute, RouteUptimeAggregate } from '@/lib/api'
import { createStore } from 'juststore'

export type RouteDisplaySettings = {
  dockerOnly: boolean
  hideUnknown: boolean
  hideExcluded: boolean
  hideUptimebar: boolean
}

export type RouteKey = string & { __brand: 'RouteKey' }

export type DockerStatsSummary = {
  cpuPercent: number
  memoryUsage: number
  memoryLimit: number
  memoryPercent: number
  networkRx: number
  networkTx: number
  blockRead: number
  blockWrite: number
  running: boolean
}

type RouteState = {
  routeKeys: RouteKey[]
  uptime: Record<RouteKey, RouteUptimeAggregate>
  routeDetails: Record<RouteKey, RouteRoute>
  dockerStats: Record<RouteKey, DockerStatsSummary | null>
  proxmoxStats: Record<RouteKey, string | null>
  proxmoxNodeStats: Record<RouteKey, ProxmoxNodeStats | null>
  displaySettings: RouteDisplaySettings
  logsAutoScroll: boolean
  mobileDialogOpen: boolean
}

export const store = createStore<RouteState>('routes', {
  routeKeys: [],
  uptime: {},
  routeDetails: {},
  dockerStats: {},
  proxmoxStats: {},
  proxmoxNodeStats: {},
  displaySettings: {
    dockerOnly: false,
    hideUnknown: false,
    hideExcluded: false,
    hideUptimebar: false,
  },
  logsAutoScroll: true,
  mobileDialogOpen: false,
})

export function useSelectedRoute(): RouteKey {
  return (useFragment() || '') as RouteKey
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
