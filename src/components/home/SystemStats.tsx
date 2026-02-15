import type { FieldPath } from 'juststore'
import { Clock, Cpu, HardDrive, type LucideIcon, MemoryStick } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SystemStatsProvider from './SystemStatsProvider'
import SystemStatValue from './SystemStatValue'
import type { Store } from './store'

export default function SystemStats() {
  return (
    <div className="grid grid-cols-4 sm:gap-4">
      {statsProps.map(stat => (
        <Card key={stat.key} className="backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <SystemStatValue
              valueKey={stat.key}
              descriptionKey={stat.descriptionKey}
              type={stat.type}
            />
          </CardContent>
        </Card>
      ))}
      <Suspense>
        <SystemStatsProvider />
      </Suspense>
    </div>
  )
}

type StatProp = {
  label: string
  icon: LucideIcon
  type: 'text' | 'progress' | 'duration'
  color: string
  key: FieldPath<Store['systemInfo']>
  descriptionKey?: FieldPath<Store['systemInfo']>
  format?: (value: number) => string
}

const statsProps: StatProp[] = [
  {
    label: 'Uptime',
    icon: Clock,
    type: 'duration',
    color: 'text-primary',
    key: 'uptime',
  },
  {
    label: 'CPU Usage',
    icon: Cpu,
    type: 'progress',
    color: 'bg-chart-1',
    key: 'cpuAverage',
  },
  {
    label: 'Memory',
    icon: MemoryStick,
    type: 'progress',
    color: 'bg-chart-2',
    key: 'memoryUsage',
    descriptionKey: 'memoryUsageDesc',
  },
  {
    label: 'Disk Usage',
    icon: HardDrive,
    type: 'progress',
    color: 'bg-chart-3',
    key: 'rootPartitionUsage',
    descriptionKey: 'rootPartitionUsageDesc',
  },
] as const
