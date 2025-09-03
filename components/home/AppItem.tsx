import { Card, CardContent } from '@/components/ui/card'
import type { HomepageItem } from '@/lib/api'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { forwardRef } from 'react'
import { AppIcon } from '../AppIcon'
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu'
import { Dialog } from '../ui/dialog'
import AppItemContextMenuContent from './AppitemContextMenuContent'
import HealthBubble from './HealthBubble'

export default function AppItem({ app }: { app: HomepageItem }) {
  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link href={app.url} target="_blank" prefetch={false}>
            <AppItemInner app={app} />
          </Link>
        </ContextMenuTrigger>
        <AppItemContextMenuContent app={app} />
      </ContextMenu>
    </Dialog>
  )
}

const AppItemInner = forwardRef<HTMLDivElement, { app: HomepageItem }>(({ app, ...props }, ref) => {
  const hasWidgets = Array.isArray(app.widgets) && app.widgets.length > 0

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
          <HealthBubble alias={app.alias} />
          <div className="rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <AppIcon className="h-6 w-6" item={app} />
          </div>
          <div className="flex flex-col items-start space-y-1">
            <h3 className="font-medium text-sm">{app.name || app.alias}</h3>
            {app.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{app.description}</p>
            )}
          </div>
        </div>

        {hasWidgets && (
          <div className="w-full space-y-3 mt-3">
            <div
              className={cn(
                'grid gap-2',
                app.widgets && app.widgets.length <= 2
                  ? 'grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-3'
              )}
            >
              {app.widgets.map((widget, index) => (
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
})

AppItemInner.displayName = 'AppItem'
