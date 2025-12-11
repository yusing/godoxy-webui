'use client'

import type {
  Agent,
  MetricsPeriod,
  SensorsTemperatureStat,
  SystemInfo,
  SystemInfoAggregate,
  SystemInfoAggregateMode,
} from '@/lib/api'
import { createStore } from 'juststore'

type Store = {
  temperatureUnit: 'celsius' | 'fahrenheit'
  metricsPeriod: MetricsPeriod
  agentList: string[]
  agents: Record<string, Agent>
  systemInfo: Record<string, SystemInfo>
  systemInfoGraphs: Record<
    string,
    Record<MetricsPeriod, Record<SystemInfoAggregateMode, SystemInfoAggregate>>
  >
  readyState: boolean
}

export const store = createStore<Store>('servers', {
  temperatureUnit: 'celsius',
  metricsPeriod: '1h',
  agentList: [],
  agents: {},
  systemInfo: {},
  systemInfoGraphs: {},
  readyState: false,
})

const cpuSensorKeys = [
  'coretemp_package_id_0',
  'coretemp_package_id_1',
  'coretemp_physical_id_0',
  'coretemp_physical_id_1',
  'cpu_thermal',
]

export function useSensorsInfo(agent: string) {
  return store.systemInfo[agent]!.sensors.useCompute(value => {
    // backward compatibility: sensors can be an object map
    const sensors = Array.isArray(value)
      ? value
      : (Object.values(value) as SensorsTemperatureStat[])

    type Status = 'warning' | 'critical'

    let diskTemp: number | null = null
    let diskTempStatus: Status | null = null
    let cpuTemp: number | null = null
    let cpuTempStatus: Status | null = null

    for (const s of sensors) {
      if (!Number.isFinite(s.temperature)) {
        continue
      }
      if (diskTemp === null && s.name === 'nvme_composite') {
        diskTemp = s.temperature
        if (s.temperature >= s.critical) {
          diskTempStatus = 'critical'
        } else if (s.temperature >= s.high) {
          diskTempStatus = 'warning'
        }
      } else if (cpuTemp === null && cpuSensorKeys.includes(s.name)) {
        cpuTemp = s.temperature
        if (s.temperature >= s.critical) {
          cpuTempStatus = 'critical'
        } else if (s.temperature >= s.high) {
          cpuTempStatus = 'warning'
        }
      }
      if (diskTemp !== null && cpuTemp !== null) {
        break
      }
    }

    return {
      diskTemp,
      diskTempStatus,
      cpuTemp,
      cpuTempStatus,
    }
  })
}
