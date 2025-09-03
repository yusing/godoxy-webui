import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { forwardRef } from 'react'
import { AppIcon } from '../AppIcon'
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu'
import { Dialog } from '../ui/dialog'
import AppItemContextMenuContent from './AppitemContextMenuContent'
import HealthBubble from './HealthBubble'
import { store } from './store'

export default function AppItem({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const url = store.useValue(`homepageCategories.${categoryIndex}.items.${appIndex}.url`)!
  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link href={url} target="_blank" prefetch={false}>
            <AppItemInner categoryIndex={categoryIndex} appIndex={appIndex} />
          </Link>
        </ContextMenuTrigger>
        <AppItemContextMenuContent categoryIndex={categoryIndex} appIndex={appIndex} />
      </ContextMenu>
    </Dialog>
  )
}

const AppItemInner = forwardRef<HTMLDivElement, { categoryIndex: number; appIndex: number }>(
  ({ categoryIndex, appIndex, ...props }, ref) => {
    const baseKey = `homepageCategories.${categoryIndex}.items.${appIndex}` as const
    const alias = store.useValue(`${baseKey}.alias`)!
    const widgets = store.useValue(`${baseKey}.widgets`)!
    const hasWidgets = Array.isArray(widgets) && widgets.length > 0

    return (
      <Card
        ref={ref}
        className={cn(
          'border-accent/50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 px-0 py-4 row-span-2',
          hasWidgets && 'row-span-3'
        )}
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
              <store.Render path={`${baseKey}.icon`}>
                {icon => <AppIcon className="h-6 w-6" alias={alias} url={icon} />}
              </store.Render>
            </div>
            <div className="flex flex-col items-start space-y-1">
              <store.Render path={`${baseKey}.name`}>
                {name => <h3 className="font-medium text-sm">{name || alias}</h3>}
              </store.Render>
              <store.Render path={`${baseKey}.description`}>
                {description =>
                  description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                  )
                }
              </store.Render>
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
