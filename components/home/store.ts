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
  settings: {
    sortMethod: 'clicks' | 'alphabetical' | 'custom'
    // Future settings can be added here
  }
}

type SystemInfoSimple = {
  uptime: number
  cpuAverage: number
  rootPartitionUsage: number
  memoryUsage: number
}

export const store = createStore<Store>('homepage', {
  systemInfo: {
    uptime: 0,
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
  settings: {
    sortMethod: 'alphabetical',
  },
})
