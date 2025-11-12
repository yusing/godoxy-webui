import type { HomepageItem } from '@/lib/api'
import { match } from '@/lib/match'
import { useEffect, useMemo } from 'react'
import AppCategoryEmpty from './AppCategoryEmpty'
import AppItem from './AppItem'
import { store } from './store'

type ItemState = {
  show: boolean
  index: number // the original index before filtering
}

function getItemState(items: HomepageItem[], searchQuery: string, category: string) {
  let isEmpty = true
  const state = items.reduce(
    (acc, item, itemIndex) => {
      if (searchQuery && !match(item.name, searchQuery)) {
        acc[item.alias] = {
          show: false,
          index: itemIndex,
        }
        return acc
      }
      const show = item.show
      const favorite = category === 'Favorites' && item.favorite
      switch (category) {
        case 'Hidden': // show only hidden items on Hidden category
          acc[item.alias] = {
            show: show === false,
            index: itemIndex,
          }
          break
        case 'Favorites': // show only favorite items on Favorite category
          acc[item.alias] = {
            show: show && favorite,
            index: itemIndex,
          }
          break
        default: // show only visible items on other categories, including 'All'
          acc[item.alias] = {
            show: show ?? false,
            index: itemIndex,
          }
      }
      if (acc[item.alias]!.show) {
        isEmpty = false
      }
      return acc
    },
    {} as Record<string, ItemState>
  )
  return { isEmpty, state }
}

export default function AppCategory({
  category,
  items,
  index,
}: {
  category: string
  items: HomepageItem[]
  index: number
}) {
  const searchQuery = store.searchQuery.use()
  const { isEmpty, state: itemState } = useMemo(
    () => getItemState(items, searchQuery, category),
    [items, searchQuery, category]
  )

  useEffect(() => {
    store.itemState.set(itemState)
  }, [itemState])

  if (isEmpty) {
    return <AppCategoryEmpty />
  }

  return (
    <div
      id="app-category"
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max"
    >
      {items
        ?.filter(app => itemState[app.alias]!.show)
        .map((app, visibleIndex) => (
          <AppItem
            key={app.alias}
            categoryIndex={index}
            appIndex={itemState[app.alias]!.index}
            visibleIndex={visibleIndex}
          />
        ))}
    </div>
  )
}
