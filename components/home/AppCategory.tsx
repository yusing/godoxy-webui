import type { HomepageItem } from '@/lib/api'
import { useRef } from 'react'
import AppCategoryEmpty from './AppCategoryEmpty'
import AppItem from './AppItem'

type ItemState = {
  show: boolean
  index: number // the original index before filtering
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
  const isEmpty = useRef(true)
  const itemState = items.reduce(
    (acc, item, itemIndex) => {
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
        isEmpty.current = false
      }
      return acc
    },
    {} as Record<string, ItemState>
  )

  if (isEmpty.current) {
    return <AppCategoryEmpty />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max">
      {items
        ?.filter(app => itemState[app.alias]!.show)
        .map(app => (
          <AppItem key={app.alias} categoryIndex={index} appIndex={itemState[app.alias]!.index} />
        ))}
    </div>
  )
}
