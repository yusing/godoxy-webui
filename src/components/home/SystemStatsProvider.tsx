import { useWebSocketApi } from '@/hooks/websocket'
import type { DiskUsageStat, MemVirtualMemoryStat, StatsResponse, SystemInfo } from '@/lib/api'
import { store } from './store'
import { formatBytes } from '@/lib/format'

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
        rootPartitionUsage: Math.round(getDiskUsage(data.disks, '/') ?? 0 * 100),
        rootPartitionUsageDesc: getDiskUsageDesc(data.disks, '/'),
        memoryUsage: Math.round(data.memory.used_percent * 100) / 100,
        memoryUsageDesc: getMemoryUsageDesc(data.memory),
      }),
  })

  useWebSocketApi<StatsResponse>({
    endpoint: '/stats',
    onMessage: data => store.systemInfo.uptime.set(data.uptime),
  })

  return null
}

function getDisk(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path) ?? Object.values(disks)[0]
}

function getDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return getDisk(disks, path)?.used_percent
}

function getDiskUsageDesc(disks: Record<string, DiskUsageStat>, path: string) {
  const disk = getDisk(disks, path)
  if (!disk) {
    return 'Unknown'
  }
  return `${formatBytes(disk.used, { precision: 1 })} / ${formatBytes(disk.total, { precision: 1 })}`
}

function getMemoryUsageDesc(memory: MemVirtualMemoryStat) {
  return `${formatBytes(memory.used, { precision: 1 })} / ${formatBytes(memory.total, { precision: 1 })}`
}
