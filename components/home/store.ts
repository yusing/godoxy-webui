import type { HealthMap } from '@/lib/api'
import { createStore } from '../../hooks/store'

export type Store = {
  systemInfo: SystemInfoSimple
  visibility: Record<string, boolean>
  favorite: Record<string, boolean>
  health: HealthMap
  pendingFavorites: boolean
  openedDialog: 'edit' | 'details' | null
}

type SystemInfoSimple = {
  hostname: string
  cpuAverage: number
  rootPartitionUsage: number
  memoryUsage: number
}

export const store = createStore<Store>('homepage', {
  systemInfo: {
    hostname: 'GoDoxy',
    cpuAverage: 0,
    rootPartitionUsage: 0,
    memoryUsage: 0,
  },
  visibility: {},
  favorite: {},
  health: {},
  pendingFavorites: false,
  openedDialog: null,
})
