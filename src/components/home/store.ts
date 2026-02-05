import { createStore } from 'juststore'
import type { HealthMap, HomepageCategory } from '@/lib/api'

export type ItemState = {
  alias: string
  index: number
  visibleIndex: number
}

export type Store = {
  systemInfo: SystemInfoSimple
  homepageCategories: HomepageCategory[]
  searchQuery: string
  itemState: Array<ItemState>
  health: HealthMap
  pendingFavorites: boolean
  editingApp?: {
    categoryIndex: number
    itemIndex: number
  }
  searchEngine: 'google' | 'duckduckgo'
  ui: {
    showKeyboardHints: boolean
    iconThemeAware: boolean
    segmentedByCategories: boolean // in 'All' and 'Favorites' categories
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
  itemState: [],
  health: {},
  pendingFavorites: false,
  searchEngine: 'duckduckgo',
  ui: {
    showKeyboardHints: true,
    iconThemeAware: false,
    segmentedByCategories: false,
  },
  navigation: {
    activeCategory: 'Favorites',
    activeItemIndex: -1,
  },
  settings: {
    sortMethod: 'alphabetical',
  },
})
