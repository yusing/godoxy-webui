'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useConsume, useProduce } from '@/hooks/producer-consumer'
import { useWebSocketApi } from '@/hooks/websocket'
import type { DiskUsageStat, SystemInfo } from '@/lib/api'
import { Cpu, HardDrive, MemoryStick, Server } from 'lucide-react'
import { useMount } from 'react-use'

export default function SystemStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {statsProps.map(stat => (
        <StatCard key={stat.label} stat={stat} />
      ))}
      <SystemStatsWatcher />
    </div>
  )
}

function StatCard({ stat }: { stat: (typeof statsProps)[number] }) {
  const value = useConsume<number | string>(stat.key)

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="px-4 py-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10">
            <stat.icon className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            {stat.type === 'text' ? (
              <p className="text-lg sm:text-base font-semibold truncate">{value}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg sm:text-base font-semibold">{value}%</p>
                <Progress value={value as number} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemStatsWatcher() {
  const produce = useProduce<number | string, StatType['key']>()

  // FIXME: adjust API to return hostname
  useMount(() => {
    produce('system-info-hostname', 'godoxy')
    produce('system-info-cpu_usage', 0)
    produce('system-info-memory_usage', 0)
    produce('system-info-disk_usage', 0)
  })

  useWebSocketApi<SystemInfo>({
    endpoint: '/metrics/system_info',
    onMessage: data => {
      produce('system-info-cpu_usage', data.cpu_average)
      produce('system-info-memory_usage', data.memory.used_percent)
      produce('system-info-disk_usage', getDiskUsage(data.disks, '/'))
    },
  })

  return null
}

function getDiskUsage(disks: Record<string, DiskUsageStat>, path: string) {
  return Object.values(disks).find(d => d.path === path)?.used_percent ?? 0
}

type StatType = (typeof statsProps)[number]

const statsProps = [
  {
    label: 'Hostname',
    icon: Server,
    type: 'text' as const,
    key: 'system-info-hostname',
  },
  {
    label: 'CPU Usage',
    icon: Cpu,
    type: 'progress' as const,
    color: 'bg-chart-1',
    key: 'system-info-cpu_usage',
  },
  {
    label: 'Memory',
    icon: MemoryStick,
    type: 'progress' as const,
    color: 'bg-chart-2',
    key: 'system-info-memory_usage',
  },
  {
    label: 'Disk Usage',
    icon: HardDrive,
    type: 'progress' as const,
    color: 'bg-chart-3',
    key: 'system-info-disk_usage',
  },
] as const
