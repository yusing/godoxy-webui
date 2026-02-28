import { useWebSocketApi } from '@/hooks/websocket'
import type { DiskUsageStat, MemVirtualMemoryStat, StatsResponse, SystemInfo } from '@/lib/api'
import { formatBytes } from '@/lib/format'
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
        rootPartitionUsage: Math.round(getDiskUsage(data.disks, '/') ?? 0 * 100),
        rootPartitionUsageDesc: getDiskUsageDesc(data.disks, '/'),
        secondaryPartitionUsage: Math.round(getSecondaryDiskUsage(data.disks, '/') ?? 0 * 100),
        secondaryPartitionUsageDesc: getSecondaryDiskUsageDesc(data.disks, '/'),
        memoryUsage: Math.round(data.memory.used_percent * 100) / 100,
        memoryUsageDesc: getMemoryUsageDesc(data.memory),
        networkSpeedUpload: data.network?.upload_speed ?? 0,
        networkSpeedDownload: data.network?.download_speed ?? 0,
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

function getSecondaryDisk(disks: Record<string, DiskUsageStat>, path: string) {
  const allDisks = Object.values(disks)
  const primaryDisk = getDisk(disks, path)
  if (!primaryDisk) {
    return undefined
  }
  return allDisks.find(d => !isSameDisk(d, primaryDisk))
}

function isSameDisk(disk: DiskUsageStat, otherDisk: DiskUsageStat) {
  if (disk.path === otherDisk.path) {
    return true
  }
  if (
    disk.fstype === otherDisk.fstype &&
    disk.total === otherDisk.total &&
    disk.used === otherDisk.used
  ) {
    return true
  }
  return false
}

function getSecondaryDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return getSecondaryDisk(disks, path)?.used_percent
}

function getSecondaryDiskUsageDesc(disks: Record<string, DiskUsageStat>, path: string) {
  const disk = getSecondaryDisk(disks, path)
  if (!disk) {
    return ''
  }
  const key = Object.entries(disks).find(([_, d]) => Object.is(d, disk))?.[0]
  return `${key}: ${formatBytes(disk.used, { precision: 1 })} / ${formatBytes(disk.total, { precision: 1 })}`
}

function getMemoryUsageDesc(memory: MemVirtualMemoryStat) {
  return `${formatBytes(memory.used, { precision: 1 })} / ${formatBytes(memory.total, { precision: 1 })}`
}
