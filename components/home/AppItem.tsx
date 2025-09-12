import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { forwardRef, useMemo } from 'react'
import { AppIcon } from '../AppIcon'
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu'
import { Dialog } from '../ui/dialog'
import AppItemContextMenuContent from './AppitemContextMenuContent'
import HealthBubble from './HealthBubble'
import { store } from './store'

type AppItemProps = {
  categoryIndex: number
  appIndex: number
  visibleIndex: number
}

export default function AppItem({ categoryIndex, appIndex, visibleIndex }: AppItemProps) {
  const item = useMemo(
    () => store.homepageCategories.at(categoryIndex).items.at(appIndex),
    [categoryIndex, appIndex]
  )

  const handleClick = async () => {
    const alias = item.alias.value
    if (alias) {
      try {
        await api.homepage.itemClick({ which: alias })
      } catch (error) {
        console.warn('Failed to track item click:', error)
      }
    }
  }

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger>
          <item.url.Render>
            {url => (
              <Link href={url!} target="_blank" prefetch={false} onClick={handleClick}>
                <AppItemInner
                  categoryIndex={categoryIndex}
                  appIndex={appIndex}
                  visibleIndex={visibleIndex}
                />
              </Link>
            )}
          </item.url.Render>
        </ContextMenuTrigger>
        <AppItemContextMenuContent categoryIndex={categoryIndex} appIndex={appIndex} />
      </ContextMenu>
    </Dialog>
  )
}

const AppItemInner = forwardRef<HTMLDivElement, AppItemProps>(
  ({ categoryIndex, appIndex, visibleIndex, ...props }, ref) => {
    const item = store.homepageCategories.at(categoryIndex).items.at(appIndex)
    const alias = item.alias.use()!
    const widgets = item.widgets.use()!
    const hasWidgets = Array.isArray(widgets) && widgets.length > 0
    const url = item.url.use()!

    return (
      <Card
        ref={ref}
        className={cn(
          'app-item border-none cursor-pointer hover:shadow-md hover:scale-105 px-0 py-4 row-span-2',
          'data-[active=true]:ring-2 data-[active=true]:ring-primary data-[active=true]:shadow-lg',
          hasWidgets && 'row-span-3'
        )}
        data-index={visibleIndex}
        data-url={url}
        data-alias={alias}
        /* initialize data-active for first item while searching */
        data-active={
          (visibleIndex === 0 && store.searchQuery.value) ||
          // NOTE: this is not a hook and is irrelevant to arrow navigation
          // only for preserving the ring on item order change
          store.navigation.activeItemIndex.value === visibleIndex
            ? 'true'
            : 'false'
        }
        {...props}
      >
        <CardContent
          className={cn(
            'flex flex-col items-center text-center h-full justify-center',
            hasWidgets && 'justify-between'
          )}
        >
          <div className="flex flex-row justify-start items-center space-x-4 w-full">
            <store.Render path={`health.${alias}.status`}>
              {status => <HealthBubble status={status ?? 'unknown'} />}
            </store.Render>
            <div className="rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <item.icon.Render>
                {icon => <AppIcon className="h-6 w-6" alias={alias} url={icon} />}
              </item.icon.Render>
            </div>
            <div className="flex flex-col items-start space-y-1">
              <item.name.Render>
                {name => <h3 className="font-medium text-sm">{name || alias}</h3>}
              </item.name.Render>
              <item.description.Render>
                {description =>
                  description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                  )
                }
              </item.description.Render>
            </div>
          </div>

          {hasWidgets && (
            <div className="w-full space-y-3 mt-3">
              <div
                className={cn(
                  'grid gap-2',
                  widgets && widgets.length <= 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                )}
              >
                {widgets.map((widget, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-primary">{widget.value}</div>
                    <div className="text-xs text-muted-foreground">{widget.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

AppItemInner.displayName = 'AppItem'
