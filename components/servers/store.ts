'use client'

import type {
  Agent,
  MetricsPeriod,
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
