'use client'
import { useWebSocketApi } from '@/hooks/websocket'
import type { DiskUsageStat, StatsResponse, SystemInfo } from '@/lib/api'
import { store } from './store'

export default function SystemStatsProvider() {
  useWebSocketApi<SystemInfo>({
    endpoint: '/metrics/system_info',
    query: {
      interval: '2s',
    },
    onMessage: data =>
      store.systemInfo.set({
        uptime: store.systemInfo.uptime.value,
        cpuAverage: Math.round(data.cpu_average * 100) / 100,
        rootPartitionUsage:
          Math.round(
            (getDiskUsage(data.disks, '/') ?? Object.values(data.disks)[0]?.used_percent ?? 0) * 100
          ) / 100,
        memoryUsage: Math.round(data.memory.used_percent * 100) / 100,
      }),
  })

  useWebSocketApi<StatsResponse>({
    endpoint: '/stats',
    onMessage: data => store.systemInfo.uptime.set(data.uptime),
  })

  return null
}

function getDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path)?.used_percent
}
