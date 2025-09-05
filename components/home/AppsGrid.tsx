'use client'

import { CategoryIcon } from '@/components/home/CategoryIcon'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWebSocketApi } from '@/hooks/websocket'
import { type HealthMap, type HomepageCategory } from '@/lib/api'
import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import AppCategory from './AppCategory'
import AppCategoryEmpty from './AppCategoryEmpty'
import { store } from './store'

export default function AppGrid() {
  const [activeCategory, setActiveCategory] = useState('Favorites')
  const [comboboxValue, setComboboxValue] = useState<string>()

  const categories = store.useValue('homepageCategories')
  const categoryNames = useMemo(() => categories?.map(c => c.name) ?? [], [categories])

  const maxTabsWithoutCombobox = 5
  const comboboxStartIndex = 5
  const visibleTabs = useMemo(() => {
    const list = categories ?? []
    if (list.length <= maxTabsWithoutCombobox) return list
    return list.slice(0, comboboxStartIndex)
  }, [categories])
  const overflowTabs = useMemo(() => {
    const list = categories ?? []
    if (list.length <= maxTabsWithoutCombobox) return []
    return list.slice(comboboxStartIndex)
  }, [categories])

  useEffect(() => {
    if (!categoryNames.length) return
    if (!categoryNames.includes(activeCategory)) {
      setActiveCategory(categoryNames[0] ?? 'All')
    }

    // Clear combobox value when active category is in visible tabs
    if (visibleTabs.some(tab => tab.name === activeCategory)) {
      setComboboxValue(undefined)
    }

    // if current category is Favorites and there are no favorites, set to All
    if (
      activeCategory === 'Favorites' &&
      !categories?.find(c => c.name === activeCategory)?.items?.some(c => c.favorite)
    ) {
      setActiveCategory('All')
    }
  }, [categoryNames, activeCategory, visibleTabs, categories])

  return (
    <div className="space-y-4">
      <HealthWatcher />
      <HomepageCategoriesProvider />
      <PendingFavoritesResetter activeCategory={activeCategory} />
      <Tabs
        value={activeCategory}
        onValueChange={value => setActiveCategory(value)}
        className="w-full"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-full sm:w-auto">
            <TabsList className="flex w-auto gap-1 h-auto p-1">
              {visibleTabs?.map(({ name: category }) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <CategoryIcon
                    category={category.toLowerCase().replace(/\s+/g, '-')}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <span className="hidden sm:inline-flex items-center gap-1">
                    {category}
                    {category === 'Favorites' && <FavoritesTabIndicator />}
                  </span>
                </TabsTrigger>
              ))}
              {overflowTabs.length > 0 && (
                <Combobox
                  value={comboboxValue}
                  options={overflowTabs.map(c => ({
                    label: c.name,
                    icon: (
                      <CategoryIcon
                        category={c.name.toLowerCase().replace(/\s+/g, '-')}
                        className="h-3 w-3 sm:h-4 sm:w-4"
                      />
                    ),
                  }))}
                  placeholder="More"
                  emptyMessage="No more categories"
                  onValueChange={value => {
                    setActiveCategory(value)
                    setComboboxValue(value)
                  }}
                />
              )}
            </TabsList>
          </div>

          <div className="relative w-full lg:w-75 min-w-0 md:min-w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <store.Render path="searchQuery">
              {(searchQuery, setSearchQuery) => (
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              )}
            </store.Render>
          </div>
        </div>

        {categories?.map(({ name: category, items }, index) => (
          <TabsContent key={category} value={category} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {categories?.length === 0 ? (
                <AppCategoryEmpty />
              ) : (
                // workaround for favorites tab, use `All` items instead
                <AppCategory
                  index={index}
                  category={category}
                  items={category === 'Favorites' ? categories[0]!.items : items}
                />
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function HomepageCategoriesProvider() {
  useWebSocketApi<HomepageCategory[]>({
    endpoint: '/homepage/items',
    onMessage: data => {
      store.set('homepageCategories', data)
    },
  })
  return null
}

function HealthWatcher() {
  useWebSocketApi<HealthMap>({
    endpoint: '/health',
    onMessage: data => store.set('health', data),
  })

  return null
}

function FavoritesTabIndicator() {
  const hasPending = store.useValue('pendingFavorites')
  if (!hasPending) return null
  return <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
}

function PendingFavoritesResetter({ activeCategory }: { activeCategory: string }) {
  useEffect(() => {
    if (activeCategory === 'Favorites') {
      store.set('pendingFavorites', false)
    }
  }, [activeCategory])
  return null
}
