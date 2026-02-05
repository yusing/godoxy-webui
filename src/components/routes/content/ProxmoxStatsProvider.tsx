import { useEffect } from 'react'
import { useWebSocketApi } from '@/hooks/websocket'
import type { ProxmoxNodeStats } from '@/lib/api'
import { store, useSelectedRoute } from '../store'

export default function ProxmoxStatsProvider() {
  const routeKey = useSelectedRoute()
  const proxmox = store.routeDetails[routeKey]?.useCompute(details => details?.proxmox)
  const isProxmox = proxmox !== undefined

  useWebSocketApi<string>({
    endpoint: `/proxmox/stats/${proxmox?.node}/${proxmox?.vmid}`,
    shouldConnect: isProxmox && !!proxmox?.vmid,
    json: false,
    onMessage: data => {
      if (!routeKey) return
      store.proxmoxStats[routeKey]!.set(data)
    },
  })

  useWebSocketApi<ProxmoxNodeStats>({
    endpoint: `/proxmox/stats/${proxmox?.node}`,
    shouldConnect: isProxmox && !proxmox?.vmid,
    onMessage: data => {
      if (!routeKey) return
      store.proxmoxNodeStats[routeKey]!.set(data)
    },
  })

  useEffect(() => {
    if (!routeKey) return
    if (!isProxmox) {
      store.proxmoxStats[routeKey]!.reset()
      store.proxmoxNodeStats[routeKey]!.reset()
    }
  }, [routeKey, isProxmox])
  return null
}
