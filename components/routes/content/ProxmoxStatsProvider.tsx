'use client'

import { useWebSocketApi } from '@/hooks/websocket'
import { useEffect } from 'react'
import { store, useSelectedRoute } from '../store'

export default function ProxmoxStatsProvider() {
  const routeKey = useSelectedRoute()
  const proxmox = store.routeDetails[routeKey]?.useCompute(details => details?.proxmox)
  const shouldConnect = proxmox !== undefined

  useWebSocketApi<string>({
    endpoint: `/proxmox/stats/${proxmox?.node}/${proxmox?.vmid}`,
    shouldConnect,
    json: false,
    onMessage: data => {
      if (!routeKey) return
      store.proxmoxStats[routeKey]!.set(data)
    },
  })

  useEffect(() => {
    if (!routeKey) return
    if (!shouldConnect) {
      store.proxmoxStats[routeKey]!.reset()
    }
  }, [routeKey, shouldConnect])
  return null
}
