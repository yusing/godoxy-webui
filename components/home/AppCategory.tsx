import type { HomepageItem } from '@/lib/api'
import AppCategoryEmpty from './AppCategoryEmpty'
import AppItem from './AppItem'
import { store } from './store'

export default function AppCategory({
  category,
  items,
}: {
  category: string
  items: HomepageItem[]
}) {
  const visibleItems = items.reduce(
    (acc, item) => {
      const show = store.value(`visibility.${item.alias}`) ?? item.show
      const favorite =
        category === 'Favorites' && (store.value(`favorite.${item.alias}`) ?? item.favorite)
      switch (category) {
        case 'Hidden': // show only hidden items on Hidden category
          acc[item.alias] = show === false
          break
        case 'Favorites': // show only favorite items on Favorite category
          acc[item.alias] = show && favorite
          break
        default: // show only visible items on other categories, including 'All'
          acc[item.alias] = show ?? false
      }

      return acc
    },
    {} as Record<string, boolean>
  )

  if (Object.keys(visibleItems).length === 0) {
    return <AppCategoryEmpty />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max">
      {items
        ?.filter(app => visibleItems[app.alias])
        .map(app => (
          <AppItem key={app.alias} app={app} />
        ))}
    </div>
  )
}
