import type { HealthMap, HomepageCategory } from '@/lib/api'
import { createStore } from '../../hooks/store'

export type ItemState = {
  show: boolean
  index: number
}

export type Store = {
  systemInfo: SystemInfoSimple
  homepageCategories: HomepageCategory[]
  searchQuery: string
  itemState: Record<string, ItemState>
  health: HealthMap
  pendingFavorites: boolean
  openedDialog: 'edit' | 'details' | null
  searchEngine: 'google' | 'duckduckgo'
  ui: {
    showKeyboardHints: boolean
  }
  navigation: {
    activeCategory: string
    activeItemIndex: number
  }
}

type SystemInfoSimple = {
  uptime: string
  cpuAverage: number
  rootPartitionUsage: number
  memoryUsage: number
}

export const store = createStore<Store>('homepage', {
  systemInfo: {
    uptime: '0s',
    cpuAverage: 0,
    rootPartitionUsage: 0,
    memoryUsage: 0,
  },
  homepageCategories: [],
  searchQuery: '',
  itemState: {},
  health: {},
  pendingFavorites: false,
  openedDialog: null,
  searchEngine: 'duckduckgo',
  ui: {
    showKeyboardHints: true,
  },
  navigation: {
    activeCategory: 'Favorites',
    activeItemIndex: -1,
  },
})
