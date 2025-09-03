'use client'
import { useWebSocketApi } from '@/hooks/websocket'
import type { DiskUsageStat, SystemInfo } from '@/lib/api'
import { store } from './store'

export default function SystemStatsProvider() {
  useWebSocketApi<SystemInfo>({
    endpoint: '/metrics/system_info',
    query: {
      interval: '2s',
    },
    onMessage: data =>
      store.set('systemInfo', {
        hostname: 'GoDoxy',
        cpuAverage: data.cpu_average,
        rootPartitionUsage:
          getDiskUsage(data.disks, '/') ?? Object.values(data.disks)[0]?.used_percent ?? 0,
        memoryUsage: data.memory.used_percent,
      }),
  })

  return null
}

function getDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path)?.used_percent
}
