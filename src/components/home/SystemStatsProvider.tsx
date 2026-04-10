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
    onMessage: data => {
      const secondDriveOptions = getSecondDriveOptions(data.disks, '/')
      const selectedSecondDrive = resolveSelectedSecondDrive(secondDriveOptions)

      if (store.selectedSecondDrive.value !== selectedSecondDrive) {
        store.selectedSecondDrive.set(selectedSecondDrive)
      }

      store.systemInfo.set({
        uptime: store.systemInfo.uptime.value,
        cpuAverage: Math.round(data.cpu_average * 100) / 100,
        rootPartitionUsage: Math.round(getDiskUsage(data.disks, '/') ?? 0),
        rootPartitionUsageDesc: getDiskUsageDesc(data.disks, '/'),
        secondaryPartitionUsage: Math.round(
          getSelectedDiskUsage(data.disks, selectedSecondDrive) ?? 0
        ),
        secondaryPartitionUsageDesc: getSelectedDiskUsageDesc(data.disks, selectedSecondDrive),
        memoryUsage: Math.round(data.memory.used_percent * 100) / 100,
        memoryUsageDesc: getMemoryUsageDesc(data.memory),
        networkSpeedUpload: data.network?.upload_speed ?? 0,
        networkSpeedDownload: data.network?.download_speed ?? 0,
      })

      store.settings.secondDriveOptions.set(secondDriveOptions)
    },
  })

  useWebSocketApi<StatsResponse>({
    endpoint: '/stats',
    onMessage: data => store.systemInfo.uptime.set(data.uptime),
  })

  return null
}

function getDisk(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path) ?? getDiskEntries(disks)[0]?.[1]
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

function getSelectedDisk(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path)
}

function getSelectedDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return getSelectedDisk(disks, path)?.used_percent
}

function getSelectedDiskUsageDesc(disks: Record<string, DiskUsageStat>, path: string) {
  const disk = getSelectedDisk(disks, path)
  if (!disk) {
    return ''
  }
  return `${disk.path}: ${formatBytes(disk.used, { precision: 1 })} / ${formatBytes(disk.total, { precision: 1 })}`
}

function getMemoryUsageDesc(memory: MemVirtualMemoryStat) {
  return `${formatBytes(memory.used, { precision: 1 })} / ${formatBytes(memory.total, { precision: 1 })}`
}

function getDiskEntries(disks: Record<string, DiskUsageStat>) {
  return Object.entries(disks).toSorted(([, left], [, right]) => {
    if (right.total !== left.total) {
      return right.total - left.total
    }
    const depthDiff = getPathDepth(left.path) - getPathDepth(right.path)
    if (depthDiff !== 0) {
      return depthDiff
    }
    return left.path.localeCompare(right.path)
  })
}

function getSecondDriveOptions(disks: Record<string, DiskUsageStat>, rootPath: string) {
  return getDiskEntries(disks)
    .map(([, disk]) => disk.path)
    .filter(path => path !== rootPath)
}

function resolveSelectedSecondDrive(options: string[]) {
  const currentSelection = store.selectedSecondDrive.value
  if (currentSelection === '') {
    return ''
  }
  if (currentSelection && options.includes(currentSelection)) {
    return currentSelection
  }
  return ''
}

function getPathDepth(path: string) {
  if (path === '/') {
    return 0
  }
  return path.split('/').filter(Boolean).length
}
