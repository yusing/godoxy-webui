'use client'

import { CategoryIcon } from '@/components/home/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWebSocketApi } from '@/hooks/websocket'
import { type HealthMap, type HomepageCategory } from '@/lib/api'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo } from 'react'
import AppCategory from './AppCategory'
import AppCategoryEmpty from './AppCategoryEmpty'
import ArrowNavigation from './ArrowNavigation'
import Searchbox from './Searchbox'
import { store } from './store'

export default function AppGrid() {
  const [activeCategory, setActiveCategory] = store.navigation.activeCategory.useState()

  const categories = store.use('homepageCategories')
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
      <ArrowNavigation />
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
                  onKeyDown={e => {
                    // prevent arrow navigation on tabs, we handle it with ArrowNavigation
                    e.stopPropagation()
                    e.preventDefault()
                  }}
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
                  value={overflowTabs.find(c => c.name === activeCategory)?.name}
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
                  onValueChange={value => setActiveCategory(value)}
                />
              )}
            </TabsList>
          </div>
          <Searchbox />
        </div>

        {/* Keyboard hints */}
        <store.ui.showKeyboardHints.Render>
          {(show, setShow) =>
            show ? (
              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <Kbd>
                    <ArrowUp className="h-3 w-3" />
                  </Kbd>
                  <Kbd>
                    <ArrowDown className="h-3 w-3" />
                  </Kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-1">
                  <Kbd>
                    <ArrowLeft className="h-3 w-3" />
                  </Kbd>
                  <Kbd>
                    <ArrowRight className="h-3 w-3" />
                  </Kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-1">
                  <Kbd>Enter</Kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1">
                  <Kbd>Esc</Kbd>
                  <span>Reset</span>
                </div>
                <div className="flex items-center gap-1">
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>
                    <ArrowLeft className="h-3 w-3" />
                  </Kbd>
                  <Kbd>
                    <ArrowRight className="h-3 w-3" />
                  </Kbd>
                  <span>Switch category</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="hidden lg:inline">Tab is disabled on this page</span>
                  <Button size="sm" variant="outline" onClick={() => setShow(false)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null
          }
        </store.ui.showKeyboardHints.Render>

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
      store.homepageCategories.set(data)
    },
  })
  return null
}

function HealthWatcher() {
  useWebSocketApi<HealthMap>({
    endpoint: '/health',
    onMessage: data => store.health.set(data),
  })

  return null
}

function FavoritesTabIndicator() {
  const hasPending = store.pendingFavorites.use()
  if (!hasPending) return null
  return <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
}

function PendingFavoritesResetter({ activeCategory }: { activeCategory: string }) {
  useEffect(() => {
    if (activeCategory === 'Favorites') {
      store.pendingFavorites.set(false)
    }
  }, [activeCategory])
  return null
}
