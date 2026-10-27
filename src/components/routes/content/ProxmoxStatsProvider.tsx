import { useEffect } from 'react'
import { useWebSocketApi } from '@/hooks/websocket'
import type { ProxmoxNodeStats } from '@/lib/api'
import { store, useSelectedRoute } from '../store'

export default function ProxmoxStatsProvider() {
  const routeKey = useSelectedRoute()
  const proxmox = store.useCompute('routeDetails', data => data[routeKey]?.proxmox, [routeKey])
  const isProxmox = proxmox !== undefined

  useWebSocketApi<string>({
    endpoint: `/proxmox/stats/${proxmox?.node}/${proxmox?.vmid}`,
    shouldConnect: isProxmox && !!proxmox?.vmid,
    json: false,
    onMessage: data => {
      if (!routeKey) return
      store.proxmoxStats.set(stats => ({ ...stats, [routeKey]: data }))
    },
  })

  useWebSocketApi<ProxmoxNodeStats>({
    endpoint: `/proxmox/stats/${proxmox?.node}`,
    shouldConnect: isProxmox && !proxmox?.vmid,
    onMessage: data => {
      if (!routeKey) return
      store.proxmoxNodeStats.set(stats => ({ ...stats, [routeKey]: data }))
    },
  })

  useEffect(() => {
    if (!routeKey) return
    if (!isProxmox) {
      store.proxmoxStats.set(stats => {
        const next = { ...stats }
        delete next[routeKey]
        return next
      })
      store.proxmoxNodeStats.set(stats => {
        const next = { ...stats }
        delete next[routeKey]
        return next
      })
    }
  }, [routeKey, isProxmox])
  return null
}
