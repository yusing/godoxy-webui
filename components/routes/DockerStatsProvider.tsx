'use client'

import { useWebSocketApi } from '@/hooks/websocket'
import type { ContainerStatsResponse } from '@/lib/api'
import { useEffect, useMemo } from 'react'
import { store, useSelectedRoute, type DockerStatsSummary } from './store'
import { decodeRouteKey } from './utils'

function summarizeStats(stats: ContainerStatsResponse): DockerStatsSummary {
  const cpuTotal = stats.cpu_stats.cpu_usage.total_usage ?? 0
  const cpuPrevTotal = stats.precpu_stats.cpu_usage.total_usage ?? 0
  const systemTotal = stats.cpu_stats.system_cpu_usage ?? 0
  const systemPrevTotal = stats.precpu_stats.system_cpu_usage ?? 0
  const cpuDelta = cpuTotal - cpuPrevTotal
  const systemDelta = systemTotal - systemPrevTotal
  const onlineCpus =
    stats.cpu_stats.online_cpus ?? stats.cpu_stats.cpu_usage.percpu_usage.length ?? 0
  const cpuPercent =
    systemDelta > 0 && cpuDelta > 0 && onlineCpus > 0
      ? (cpuDelta / systemDelta) * onlineCpus * 100
      : 0

  const memoryUsage = stats.memory_stats.usage ?? 0
  const memoryLimit = stats.memory_stats.limit ?? 0
  const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0

  const networks = stats.networks ? Object.values(stats.networks) : []
  const networkRx = networks.reduce((sum, net) => sum + (net.rx_bytes ?? 0), 0)
  const networkTx = networks.reduce((sum, net) => sum + (net.tx_bytes ?? 0), 0)

  const ioEntries = stats.blkio_stats?.io_service_bytes_recursive ?? []
  const { blockRead, blockWrite } = ioEntries.reduce(
    (acc, entry) => {
      const op = entry.op?.toLowerCase?.() ?? ''
      if (op === 'read') acc.blockRead += entry.value ?? 0
      if (op === 'write') acc.blockWrite += entry.value ?? 0
      return acc
    },
    { blockRead: 0, blockWrite: 0 }
  )

  const running = stats.cpu_stats.online_cpus > 0

  return {
    cpuPercent,
    memoryUsage,
    memoryLimit,
    memoryPercent,
    networkRx,
    networkTx,
    blockRead,
    blockWrite,
    running,
  }
}

export default function DockerStatsProvider() {
  const routeKey = useSelectedRoute()
  const isDocker = store.uptime[routeKey]?.is_docker.use() ?? false
  const routeId = useMemo(() => (routeKey ? decodeRouteKey(routeKey) : ''), [routeKey])
  const shouldConnect = Boolean(routeId) && isDocker

  useWebSocketApi<ContainerStatsResponse>({
    endpoint: `/docker/stats/${routeId}`,
    httpAsInitial: true,
    shouldConnect,
    onMessage: data => {
      if (!routeKey) return
      store.dockerStats[routeKey]?.set(summarizeStats(data))
    },
  })

  useEffect(() => {
    if (!routeKey) return
    if (!shouldConnect) {
      store.dockerStats[routeKey]?.reset()
    }
  }, [routeKey, shouldConnect])

  return null
}
