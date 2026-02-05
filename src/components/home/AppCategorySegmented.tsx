import { useEffect, useMemo } from 'react'
import type { HomepageItem } from '@/lib/api'
import AppItem from './AppItem'
import { type ItemState, store } from './store'

type Group = { name: string; apps: HomepageItem[] }
type MergedGroup = Group | { groups: Group[] }

const MAX_ITEMS_PER_GRID = 4

function collectGroups(items: HomepageItem[], itemState: Array<ItemState>) {
  const groups: Record<string, HomepageItem[]> = {}
  itemState.forEach(item => {
    const key = items[item.index]!.category || 'Others'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key]!.push(items[item.index]!)
  })
  return Object.entries(groups)
}

function splitIntoChunks(name: string, apps: HomepageItem[]): Group[] {
  if (apps.length <= MAX_ITEMS_PER_GRID) return [{ name, apps }]
  const chunks: HomepageItem[][] = []
  for (let i = 0; i < apps.length; i += MAX_ITEMS_PER_GRID) {
    chunks.push(apps.slice(i, i + MAX_ITEMS_PER_GRID))
  }
  const totalChunks = chunks.length
  return chunks.map((chunk, idx) => ({
    name: totalChunks > 1 ? `${name} (${idx + 1}/${totalChunks})` : name,
    apps: chunk,
  }))
}

function pairSmallGroups(groups: Group[]): MergedGroup[] {
  const small: Group[] = []
  const large: Group[] = []
  groups.forEach(group => {
    if (group.apps.length < 2) {
      small.push(group)
    } else {
      large.push(group)
    }
  })
  const merged: MergedGroup[] = [...large]
  for (let i = 0; i < small.length; i += 2) {
    merged.push({ groups: small.slice(i, i + 2) })
  }
  return merged
}

type Props = {
  categoryIndex: number
  items: HomepageItem[]
  itemState: Array<ItemState>
}

export default function AppCategorySegmented({ categoryIndex, items, itemState }: Props) {
  const groupedItems = useMemo(() => {
    const baseGroups = collectGroups(items, itemState)
    if (!baseGroups.length) return []
    const balancedGroups = baseGroups.flatMap(([name, apps]) => splitIntoChunks(name, apps))
    return pairSmallGroups(balancedGroups)
  }, [items, itemState])

  const visibleItemsInRenderOrder = useMemo(() => {
    const indexByAlias = new Map(itemState.map(item => [item.alias, item.index]))
    let visibleIndex = 0
    const ordered: Array<ItemState> = []
    groupedItems.forEach(group => {
      const groups = 'groups' in group ? group.groups : [group]
      groups.forEach(({ apps }) => {
        apps.forEach(app => {
          ordered.push({
            alias: app.alias,
            index: indexByAlias.get(app.alias) ?? 0,
            visibleIndex,
          })
          visibleIndex++
        })
      })
    })
    return ordered
  }, [groupedItems, itemState])

  const visibleItemByAlias = useMemo(
    () => new Map(visibleItemsInRenderOrder.map(item => [item.alias, item])),
    [visibleItemsInRenderOrder]
  )

  useEffect(() => {
    store.itemState.set(visibleItemsInRenderOrder)
  }, [visibleItemsInRenderOrder])

  const segmentGridClass = useMemo(() => {
    const count = groupedItems.length
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2'
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }, [groupedItems.length])

  return (
    <div className={`grid gap-3 ${segmentGridClass}`}>
      {groupedItems.map((group, idx) => {
        if ('groups' in group) {
          return (
            <div key={`merged-${idx}`} className="space-y-2">
              {group.groups.map(smallGroup => (
                <div key={smallGroup.name} className="space-y-2 rounded-lg bg-card/80 p-3">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {smallGroup.name}
                  </div>
                  <div className="flex flex-col gap-2">
                    {smallGroup.apps.map(app => {
                      const item = visibleItemByAlias.get(app.alias)!
                      return (
                        <AppItem
                          key={app.alias}
                          categoryIndex={categoryIndex}
                          appIndex={item.index}
                          visibleIndex={item.visibleIndex}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        }
        return (
          <div key={group.name} className="space-y-2 rounded-lg bg-card/80 p-3">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide">
              {group.name}
            </div>
            <div className="flex flex-col gap-2">
              {group.apps.map(app => {
                const item = visibleItemByAlias.get(app.alias)!
                return (
                  <AppItem
                    key={app.alias}
                    categoryIndex={categoryIndex}
                    appIndex={item.index}
                    visibleIndex={item.visibleIndex}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
