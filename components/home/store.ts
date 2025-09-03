import type { HealthMap, HomepageCategory } from '@/lib/api'
import { createStore } from '../../hooks/store'

export type Store = {
  systemInfo: SystemInfoSimple
  homepageCategories: HomepageCategory[]
  searchQuery: string
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
  homepageCategories: [],
  searchQuery: '',
  health: {},
  pendingFavorites: false,
  openedDialog: null,
})
