import type { HomepageItem } from '@/lib/api'
import { match } from '@/lib/match'
import { useEffect, useMemo } from 'react'
import AppCategoryEmpty from './AppCategoryEmpty'
import AppCategorySegmented from './AppCategorySegmented'
import AppItem from './AppItem'
import { store, type ItemState } from './store'

function getItemState(items: HomepageItem[], searchQuery: string, category: string) {
  let isEmpty = true
  let visibleIndex = 0
  const state = items.reduce((acc, item, itemIndex) => {
    if (searchQuery && !match(item.name, searchQuery)) {
      // acc[item.alias] = itemIndex
      return acc
    }
    let show = item.show
    const favorite = category === 'Favorites' && item.favorite
    switch (category) {
      case 'Hidden': // show only hidden items on Hidden category
        show = show === false
        break
      case 'Favorites': // show only favorite items on Favorite category
        show = show && favorite
        break
      default: // show only visible items on other categories, including 'All'
        show = show ?? false
    }
    if (show) {
      isEmpty = false
      acc.push({ alias: item.alias, index: itemIndex, visibleIndex })
      visibleIndex++
    }
    return acc
  }, [] as ItemState[])
  return [isEmpty, state] as const
}

export default function AppCategory({
  category,
  items,
  categoryIndex,
}: {
  category: string
  items: HomepageItem[]
  categoryIndex: number
}) {
  const searchQuery = store.searchQuery.use()
  const [isEmpty, itemState] = useMemo(
    () => getItemState(items, searchQuery, category),
    [items, searchQuery, category]
  )
  const segmented = store.ui.segmentedByCategories.use()

  const shouldSegment = useMemo(
    () => segmented && (category === 'All' || category === 'Favorites'),
    [segmented, category]
  )

  useEffect(() => {
    if (!shouldSegment) {
      store.itemState.set(itemState)
    }
  }, [itemState, shouldSegment])

  if (isEmpty) {
    return <AppCategoryEmpty />
  }

  if (shouldSegment) {
    return (
      <AppCategorySegmented categoryIndex={categoryIndex} items={items} itemState={itemState} />
    )
  }

  return (
    <div
      id="app-category"
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max"
    >
      {itemState.map(({ alias, index: appIndex, visibleIndex }) => (
        <AppItem
          key={alias}
          categoryIndex={categoryIndex}
          appIndex={appIndex}
          visibleIndex={visibleIndex}
        />
      ))}
    </div>
  )
}
