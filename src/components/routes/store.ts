import { createStore } from 'juststore'
import { useFragment } from '@/hooks/fragment'
import type { ProxmoxNodeStats, Route, RouteUptimeAggregate } from '@/lib/api'

export type RouteDisplaySettings = {
  dockerOnly: boolean
  proxmoxOnly: boolean
  hideUnknown: boolean
  hideExcluded: boolean
  hideUptimebar: boolean
}

export type DockerStatsSummary = {
  cpuPercent: number
  memoryUsage: number
  memoryLimit: number
  memoryPercent: number
  networkRx: number
  networkTx: number
  blockRead: number
  blockWrite: number
}

type RouteState = {
  routeKeys: string[]
  uptime: Record<string, RouteUptimeAggregate>
  routeDetails: Record<string, Route>
  dockerStats: Record<string, DockerStatsSummary | null>
  proxmoxStats: Record<string, string | null>
  proxmoxNodeStats: Record<string, ProxmoxNodeStats | null>
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
    proxmoxOnly: false,
    hideUnknown: false,
    hideExcluded: false,
    hideUptimebar: false,
  },
  logsAutoScroll: true,
  mobileDialogOpen: false,
})

export function useSelectedRoute(): string {
  return useFragment() || ''
}

// setSelectedRoute changes the active route item in the sidebar
export function setSelectedRoute(key: string) {
  const prevActive = document.querySelector('.route-item[data-active="true"]') as HTMLElement | null
  if (prevActive) {
    prevActive.removeAttribute('data-active')
  }

  const el = document.getElementById(`route-${key}`)
  if (el) el.setAttribute('data-active', 'true')

  window.location.hash = `#${key}`
}
