import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Clock, Cpu, HardDrive, MemoryStick, type LucideIcon } from 'lucide-react'
import type { FieldPath } from 'react-hook-form'
import type { Store } from './store'
import SystemStatsProvider from './SystemStatsProvider'
import SystemStatValue from './SystemStatValue'

export default function SystemStats() {
  // on mobile, displays as one rounded card
  // on desktop, displays as 4 cards in a grid
  return (
    <div className="grid grid-cols-4 sm:gap-4">
      {statsProps.map((stat, index) => (
        <Card
          key={stat.key}
          shrink
          className={cn(
            'shadow-sm hover:shadow-md transition-shadow border-0 sm:border rounded-none sm:rounded-lg',
            index === 0 && 'rounded-l-lg',
            index === statsProps.length - 1 && 'rounded-r-lg'
          )}
        >
          <CardContent className="px-4 py-0">
            <div className="flex items-center gap-3 flex-col sm:flex-row">
              <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              <SystemStatValue valueKey={stat.key} type={stat.type} label={stat.label} />
            </div>
          </CardContent>
        </Card>
      ))}
      <SystemStatsProvider />
    </div>
  )
}

type StatProp = {
  label: string
  icon: LucideIcon
  type: 'text' | 'progress'
  color: string
  key: FieldPath<Store['systemInfo']>
}

const statsProps: StatProp[] = [
  {
    label: 'Uptime',
    icon: Clock,
    type: 'text' as const,
    color: 'text-primary',
    key: 'uptime',
  },
  {
    label: 'CPU Usage',
    icon: Cpu,
    type: 'progress' as const,
    color: 'bg-chart-1',
    key: 'cpuAverage',
  },
  {
    label: 'Memory',
    icon: MemoryStick,
    type: 'progress' as const,
    color: 'bg-chart-2',
    key: 'memoryUsage',
  },
  {
    label: 'Disk Usage',
    icon: HardDrive,
    type: 'progress' as const,
    color: 'bg-chart-3',
    key: 'rootPartitionUsage',
  },
] as const
