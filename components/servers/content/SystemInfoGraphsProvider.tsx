'use client'

import { useWebSocketApi } from '@/hooks/websocket'
import type { MetricsPeriod, SystemInfoAggregate, SystemInfoAggregateMode } from '@/lib/api'
import { store } from '../store'

type Props = {
  agent: string
  period: MetricsPeriod
}

const MODES: SystemInfoAggregateMode[] = [
  'cpu_average',
  'memory_usage',
  'disks_read_speed',
  'disks_write_speed',
  'disks_iops',
  'disk_usage',
  'network_speed',
  'network_transfer',
  'sensor_temperature',
]

export default function SystemInfoGraphsProvider({ agent, period }: Props) {
  return (
    <>
      {MODES.map(mode => (
        <PerAggregateProvider
          key={`${agent}-${period}-${mode}`}
          agent={agent}
          period={period}
          mode={mode}
        />
      ))}
    </>
  )
}

function PerAggregateProvider({
  agent,
  period,
  mode,
}: {
  agent: string
  period: MetricsPeriod
  mode: SystemInfoAggregateMode
}) {
  useWebSocketApi<SystemInfoAggregate>({
    endpoint: `/metrics/system_info`,
    query: {
      period,
      aggregate: mode,
      agent_name: agent === 'Main Server' ? '' : agent,
    },
    onMessage: data => {
      store.set(`systemInfoGraphs.${agent}.${period}.${mode}`, data)
    },
  })

  // no UI
  return null
}
