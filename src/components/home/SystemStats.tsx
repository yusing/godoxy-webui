import type { FieldPath } from 'juststore'
import { Clock, Cpu, HardDrive, type LucideIcon, MemoryStick, Wifi } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import SystemStatsProvider from './SystemStatsProvider'
import SystemStatValue, { type SystemStatValueType } from './SystemStatValue'
import { type Store, store } from './store'

export default function SystemStats() {
  return (
    <>
      <Suspense>
        <SystemStatsProvider />
      </Suspense>
      <SystemStatsMobile />
      <SystemStatsDesktop />
    </>
  )
}

function SystemStatsMobile() {
  const stats = statsProps.filter(stat => {
    return !('hideOnMobile' in stat && stat.hideOnMobile)
  })

  return (
    <Card size="sm" className="mx-1 block sm:hidden">
      <CardContent className="grid grid-cols-5 gap-y-2 [&>*:nth-child(odd)]:col-start-1 [&>*:nth-child(even)]:col-start-4">
        {stats.map(stat => (
          <MobileStatRow key={stat.key} stat={stat} />
        ))}
      </CardContent>
    </Card>
  )
}

function SystemStatsDesktop() {
  const hasSecondaryDisk = Boolean(store.systemInfo.secondaryPartitionUsageDesc.use())

  return (
    <div className="hidden sm:grid grid-cols-2 gap-2 px-1 sm:grid-cols-4 md:grid-cols-5 sm:gap-4">
      {statsProps.map(stat => (
        <Card
          key={stat.key}
          size="sm"
          className={cn('h-full', stat.key === 'networkSpeedUpload' && 'hidden md:flex')}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-3.5 text-muted-foreground sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 sm:space-y-2">
            {stat.key === 'rootPartitionUsage' && hasSecondaryDisk ? (
              <div className="flex justify-between gap-3">
                <div className="space-y-1.5 sm:space-y-2 w-full xl:w-auto">
                  <SystemStatValue
                    valueKey={stat.key}
                    descriptionKey={stat.descriptionKey}
                    type={stat.type}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2 hidden xl:block">
                  <SystemStatValue
                    valueKey={stat.secondaryKey}
                    descriptionKey={stat.secondaryDescriptionKey}
                    type={stat.type}
                  />
                </div>
              </div>
            ) : stat.key === 'networkSpeedUpload' ? (
              <div className="flex flex-col gap-0.5">
                <SystemStatValue valueKey={stat.key} type="upload" />
                <SystemStatValue valueKey={stat.secondaryKey} type="download" />
              </div>
            ) : (
              <SystemStatValue
                valueKey={stat.key}
                descriptionKey={stat.descriptionKey}
                type={stat.type}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type StatProp = {
  hideOnMobile?: boolean
  label: string
  mobileLabel: string
  icon: LucideIcon
  mobileValueMode?: 'percent' | 'description' | 'duration' | 'text' | 'networkSpeed'
  type: SystemStatValueType
  color: string
  key: FieldPath<Store['systemInfo']>
  descriptionKey?: FieldPath<Store['systemInfo']>
  secondaryKey?: FieldPath<Store['systemInfo']>
  secondaryDescriptionKey?: FieldPath<Store['systemInfo']>
  format?: (value: number) => string
}

function MobileStatRow({ stat }: { stat: StatProp }) {
  const value = store.systemInfo[stat.key].use()

  const displayValue = (() => {
    if (stat.mobileValueMode === 'duration') {
      return formatDuration(Number(value), { unit: 's' })
    }
    if (stat.mobileValueMode === 'text') {
      return String(value)
    }
    if (stat.mobileValueMode === 'networkSpeed') {
      return null
    }
    return `${value}%`
  })()

  return (
    <div className="flex items-center justify-between gap-2 col-span-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <stat.icon className="size-4" />
        <span className="text-sm">{stat.mobileLabel}</span>
      </div>
      <span className="text-sm font-medium tabular-nums">{displayValue}</span>
    </div>
  )
}

const statsProps = [
  {
    label: 'Uptime',
    mobileLabel: 'Up',
    icon: Clock,
    mobileValueMode: 'duration',
    type: 'duration',
    color: 'text-primary',
    key: 'uptime',
    descriptionKey: undefined,
  },
  {
    label: 'CPU Usage',
    mobileLabel: 'CPU',
    icon: Cpu,
    mobileValueMode: 'percent',
    type: 'progress',
    color: 'bg-chart-1',
    key: 'cpuAverage',
    descriptionKey: undefined,
  },
  {
    label: 'Memory',
    mobileLabel: 'Mem',
    icon: MemoryStick,
    mobileValueMode: 'description',
    type: 'progress',
    color: 'bg-chart-2',
    key: 'memoryUsage',
    descriptionKey: 'memoryUsageDesc',
  },
  {
    label: 'Disk Usage',
    mobileLabel: 'Disk',
    icon: HardDrive,
    mobileValueMode: 'percent',
    type: 'progress',
    color: 'bg-chart-3',
    key: 'rootPartitionUsage',
    descriptionKey: 'rootPartitionUsageDesc',
    secondaryKey: 'secondaryPartitionUsage',
    secondaryDescriptionKey: 'secondaryPartitionUsageDesc',
  },
  {
    hideOnMobile: true,
    label: 'Network',
    mobileLabel: 'Net',
    icon: Wifi,
    mobileValueMode: 'networkSpeed',
    type: 'text',
    color: 'bg-chart-4',
    key: 'networkSpeedUpload',
    secondaryKey: 'networkSpeedDownload',
    descriptionKey: undefined,
  },
] as const satisfies StatProp[]
