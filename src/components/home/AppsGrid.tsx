import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useEffect, useMemo } from 'react'
import { CategoryIcon } from '@/components/home/CategoryIcon'
import { Button } from '@/components/ui/button'
import { CustomCombobox } from '@/components/ui/custom-combobox'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWebSocketApi } from '@/hooks/websocket'
import type { HealthMap, HomepageCategory } from '@/lib/api'
import AppCategory from './AppCategory'
import ArrowNavigation from './ArrowNavigation'
import Searchbox from './Searchbox'
import SettingsPopover from './SettingsPopover'
import { store } from './store'

export default function AppGrid() {
  const [activeCategoryValue, setActiveCategory] = store.navigation.activeCategory.useState()

  const categoryNames = store.homepageCategories.useCompute(categories =>
    categories.map(cat => cat.name)
  )
  const sortMethod = store.settings.sortMethod.use()

  const maxTabsWithoutCombobox = 5
  const comboboxStartIndex = 5
  const visibleTabs = useMemo(() => {
    const list = categoryNames
    if (list.length <= maxTabsWithoutCombobox) return list
    return list.slice(0, comboboxStartIndex)
  }, [categoryNames])
  const overflowTabs = useMemo(() => {
    const list = categoryNames
    if (list.length <= maxTabsWithoutCombobox) return []
    return list.slice(comboboxStartIndex)
  }, [categoryNames])

  const activeCategory = useMemo(() => {
    if (!categoryNames.length) return 'All'
    if (!categoryNames.includes(activeCategoryValue)) {
      return categoryNames[0] ?? 'All'
    }

    // if current category is Favorites and there are no favorites, set to All
    if (
      activeCategoryValue === 'Favorites' &&
      !store.homepageCategories
        .at(categoryNames.indexOf(activeCategoryValue))
        .items.value.some(c => c.favorite)
    ) {
      return 'All'
    }
    return activeCategoryValue
  }, [activeCategoryValue, categoryNames])

  return (
    <div className="space-y-4">
      <Suspense>
        <HealthWatcher />
        <HomepageItemsProvider sortMethod={sortMethod} />
      </Suspense>
      <PendingFavoritesResetter activeCategory={activeCategory} />
      <ArrowNavigation />
      <Tabs
        value={activeCategory}
        onValueChange={value => setActiveCategory(value)}
        className="w-full"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <TabsList className="flex w-full sm:w-auto gap-1 p-1">
              {visibleTabs?.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                  onKeyDown={e => {
                    // prevent arrow navigation on tabs, we handle it with ArrowNavigation
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <CategoryIcon
                    category={category.toLowerCase().replace(/\s+/g, '-')}
                    className="size-3 sm:size-4"
                  />
                  <span className="hidden sm:inline-flex items-center gap-1">
                    {category}
                    {category === 'Favorites' && <FavoritesTabIndicator />}
                  </span>
                </TabsTrigger>
              ))}
              {overflowTabs.length > 0 && (
                <CustomCombobox
                  value={overflowTabs.find(c => c === activeCategory)}
                  items={overflowTabs}
                  itemToIcon={c => (
                    <CategoryIcon
                      category={c.toLowerCase().replace(/\s+/g, '-')}
                      className="size-3 sm:size-4"
                    />
                  )}
                  placeholder="More"
                  emptyMessage="No more categories"
                  onValueChange={value => setActiveCategory(value ?? 'All')}
                />
              )}
            </TabsList>
            <SettingsPopover />
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
                <div className="flex items-center gap-1">
                  <Kbd>A-Z</Kbd>
                  <span>Search</span>
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

        {categoryNames?.map((category, index) => {
          // workaround for favorites tab, use `All` items instead
          const i = store.homepageCategories.at(category === 'Favorites' ? 0 : index).items
          return (
            <TabsContent key={category} value={category} className="sm:mt-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <i.Render>
                  {items => <AppCategory categoryIndex={index} category={category} items={items} />}
                </i.Render>
              </motion.div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function HomepageItemsProvider({
  sortMethod,
}: {
  sortMethod: 'alphabetical' | 'clicks' | 'custom'
}) {
  useWebSocketApi<HomepageCategory[]>({
    endpoint: '/homepage/items',
    query: { sort_method: sortMethod },
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
