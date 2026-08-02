import { Render, RenderWithUpdate } from 'juststore'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useEffect, useMemo } from 'react'
import { CategoryIcon } from '@/components/home/CategoryIcon'
import { Button } from '@/components/ui/button'
import { CustomCombobox } from '@/components/ui/custom-combobox'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWebSocketApi } from '@/hooks/websocket'
import type { HealthMap, HomepageCategory } from '@/lib/api'
import { cn } from '@/lib/utils'
import AppCategory from './AppCategory'
import ArrowNavigation from './ArrowNavigation'
import Searchbox from './Searchbox'
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
    <>
      <Suspense>
        <HealthWatcher />
        <HomepageItemsProvider sortMethod={sortMethod} />
      </Suspense>
      <PendingFavoritesResetter activeCategory={activeCategory} />
      <ArrowNavigation />
      <Tabs
        value={activeCategory}
        onValueChange={value => setActiveCategory(value)}
        className="w-full h-full min-h-0 flex flex-col"
      >
        <div className="flex shrink-0 flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <TabsList className="scrollbar-hidden flex h-10 w-full items-stretch gap-1 overflow-x-auto rounded-lg border p-1 sm:w-auto">
              {visibleTabs?.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex h-full min-h-0 items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                  onKeyDown={e => {
                    // prevent arrow navigation on tabs, we handle it with ArrowNavigation
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <CategoryIcon
                    category={category.toLowerCase().replace(/\s+/g, '-')}
                    className="size-4"
                  />
                  <span className="hidden sm:inline-flex items-center gap-1">
                    {category}
                    {category === 'Favorites' && <FavoritesTabIndicator />}
                  </span>
                </TabsTrigger>
              ))}
              {overflowTabs.length > 0 && (
                <CustomCombobox
                  triggerClassName="bg-transparent! rounded-sm"
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
          </div>
          <Searchbox />
        </div>

        {/* Keyboard hints */}
        <div className="hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:block">
          <RenderWithUpdate state={store.ui.showKeyboardHints}>
            {(show, setShow) => show && <KeyboardHints onDismiss={() => setShow(false)} />}
          </RenderWithUpdate>
        </div>

        {categoryNames?.map((category, index) => {
          // workaround for favorites tab, use `All` items instead
          const i = store.homepageCategories.at(category === 'Favorites' ? 0 : index).items
          return (
            <TabsContent
              key={category}
              value={category}
              className="sm:mt-2 min-h-0 flex-1 overflow-y-auto py-1 scrollbar-hidden sm:scrollbar-default"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <Render state={i}>
                  {items => <AppCategory categoryIndex={index} category={category} items={items} />}
                </Render>
              </motion.div>
            </TabsContent>
          )
        })}
      </Tabs>
    </>
  )
}

function KeyboardHints({ onDismiss, className }: { onDismiss: () => void; className?: string }) {
  return (
    <div
      className={cn(
        'hidden lg:flex text-nowrap',
        'rounded-xl border px-3 py-1 text-xs text-foreground/90 items-center supports-backdrop-filter:bg-muted/25 supports-backdrop-filter:backdrop-blur',
        '**:data-[slot=kbd]:border **:data-[slot=kbd]:border-border',
        '[&_svg]:size-4',
        '[&_span]:pl-1',
        'divide-x divide-foreground/10 *:px-3',
        className
      )}
    >
      <KbdGroup>
        <Kbd>
          <ArrowUp />
        </Kbd>
        <Kbd>
          <ArrowDown />
        </Kbd>
        <span>Move</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>
          <ArrowLeft />
        </Kbd>
        <Kbd>
          <ArrowRight />
        </Kbd>
        <span>Move</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Enter</Kbd>
        <span>Open</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Esc</Kbd>
        <span>Reset</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Alt</Kbd>
        <span>+</span>
        <Kbd>
          <ArrowLeft />
        </Kbd>
        <Kbd>
          <ArrowRight />
        </Kbd>
        <span>Switch category</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>A-Z</Kbd>
        <span>Search</span>
      </KbdGroup>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onDismiss}
        aria-label="Dismiss keyboard hints"
      >
        <X className="text-muted-foreground" />
      </Button>
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
