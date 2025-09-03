'use client'

import SystemInfoGraphsProvider from '@/components/servers/content/SystemInfoGraphsProvider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFragment } from '@/hooks/fragment'
import type { MetricsPeriod } from '@/lib/api'
import { formatBytes, formatTemperature } from '@/lib/format'
import { Globe } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { store } from '../store'
import MetricChart from './Charts'

export default function ServerContent() {
  return (
    <div className="content p-4 space-y-4 flex-1">
      <SystemInfoGraphsPage />
    </div>
  )
}

function SystemInfoGraphsPage() {
  const selectedAgent = useFragment()
  const agent = useMemo(() => selectedAgent || 'Main Server', [selectedAgent])

  const period = store.useValue('metricsPeriod')!
  const temperatureUnit = store.useValue('temperatureUnit')!

  const byteSizeFormatter = useCallback((value: number) => formatBytes(value, { precision: 0 }), [])
  const speedFormatter = useCallback(
    (value: number) => formatBytes(value, { precision: 0, unit: '/s' }),
    []
  )
  const iopsFormatter = useCallback((value: number) => `${value} IOPS`, [])
  const percentageFormatter = useCallback(
    (value: number) => `${Math.round(value * 100) / 100}%`,
    []
  )
  const temperatureFormatter = useCallback(
    (value: number) => formatTemperature(value, temperatureUnit),
    [temperatureUnit]
  )

  return (
    <div className="flex flex-col gap-4">
      <SystemInfoGraphsProvider agent={agent} period={period} />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-medium">
            {agent.replaceAll('%20', ' ')}
            <store.Render path={`agents.${agent}.version`}>
              {agentVersion => <span className="ml-2 text-sm font-normal">{agentVersion}</span>}
            </store.Render>
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <store.Render path={`agents.${agent}.addr`}>
              {agentAddr => <span className="text-sm font-medium">{agentAddr}</span>}
            </store.Render>
          </div>
        </div>
        <PeriodSelect value={period} onChange={period => store.set('metricsPeriod', period)} />
      </div>

      <MetricChart
        period={period}
        type="cpu_average"
        label="CPU Usage"
        description="Average CPU usage of the system"
        yAxisFormatter={percentageFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="memory_usage"
        label="Memory Usage"
        description="Memory usage of the system"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="disks_read_speed"
        label="Disk Read Speed"
        description="Disk read speed by device"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="disks_write_speed"
        label="Disk Write Speed"
        description="Disk write speed by device"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="disks_iops"
        label="Disk IOPS"
        description="Disk IOPS by device"
        yAxisFormatter={iopsFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="disk_usage"
        label="Disk Usage"
        description="Disk usage by partition"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="network_speed"
        label="Network Speed"
        description="Overall network speed of the system"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="network_transfer"
        label="Network Transfer"
        description="Overall network transfer of the system"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <MetricChart
        period={period}
        type="sensor_temperature"
        label="Temperature"
        description="Sensor temperature by device"
        yAxisFormatter={temperatureFormatter}
        agent={agent}
      />
    </div>
  )
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: MetricsPeriod
  onChange: (p: MetricsPeriod) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Label>Period</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5m">Last 5 minutes</SelectItem>
          <SelectItem value="15m">Last 15 minutes</SelectItem>
          <SelectItem value="1h">Last hour</SelectItem>
          <SelectItem value="1d">Today</SelectItem>
          <SelectItem value="1mo">This month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
