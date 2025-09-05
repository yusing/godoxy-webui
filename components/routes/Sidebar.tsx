'use client'

import {
  setSelectedRoute,
  store,
  useSelectedRoute,
  type RouteDisplaySettings,
} from '@/components/routes/store'
import { useWebSocketApi } from '@/hooks/websocket'
import type { RouteUptimeAggregate, UptimeAggregate } from '@/lib/api'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { Label } from '../ui/label'
import RoutePercentageText from './PercentageText'
import RoutesSidebarSearchBox from './SearchBox'
import RouteUptimeBar from './UptimeBar'

import { FilterIcon } from 'lucide-react'
import type { FieldPath } from 'react-hook-form'
import { AppIcon } from '../AppIcon'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { Switch } from '../ui/switch'
import './style.css'

export default function RoutesSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={sidebarRef} className="max-w-[35vw] min-w-[300px] flex flex-col">
      <div className="sidebar-header sticky top-0 px-3 py-3 flex items-center justify-between border-x">
        <Label className="text-sm">Routes</Label>
        <Popover>
          <PopoverTrigger asChild aria-label="Filters">
            <FilterIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <Setting field="dockerOnly" label="Docker only" />
            <Setting field="hideUnknown" label="Hide unknown" />
            <Setting field="hideUptimebar" label="Hide uptime" />
          </PopoverContent>
        </Popover>
      </div>
      <RoutesSidebarSearchBox />
      <RoutesSidebarItemList />
      <RoutesUptimeProvider sidebarRef={sidebarRef} />
      <SelectedRouteResetter />
      <ScrollIntoSelectedRoute />
    </div>
  )
}

function Setting({ field, label }: { field: FieldPath<RouteDisplaySettings>; label: string }) {
  const displaySettings = store.displaySettings[field].use()
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={displaySettings}
        onCheckedChange={checked => store.displaySettings[field].set(checked)}
      />
      <Label>{label}</Label>
    </div>
  )
}

function RoutesSidebarItemList() {
  const keys = store.routeKeys.use() ?? []
  return (
    <ScrollArea>
      <div className="sidebar-item-list border-b">
        {keys.map(key => {
          return <RoutesSidebarItem key={key} alias={key} />
        })}
      </div>
    </ScrollArea>
  )
}

function RoutesSidebarItem({ alias }: { alias: string }) {
  const { hideUnknown, dockerOnly } = store.displaySettings.use() ?? {}
  const currentStatus = store.uptime[alias]?.current_status.use()
  const isDocker = store.uptime[alias]?.is_docker.use()

  if (hideUnknown && currentStatus === 'unknown') {
    return null
  }

  if (dockerOnly && !isDocker) {
    return null
  }

  return (
    <div className="flex flex-col">
      <a
        id={`route-${alias}`}
        href={`#${alias}`}
        target="_self"
        onClick={() => setSelectedRoute(alias)}
        className={cn(
          'route-item text-left p-3 transition-colors border-x border-b',
          'data-[filtered=true]:hidden',
          'data-[active=true]:bg-accent',
          'hover:bg-muted/50'
        )}
      >
        <div className="flex justify-between items-center gap-4 flex-1">
          <div className="flex-shrink-0 mt-0.5 flex items-center gap-2">
            <AppIcon alias={alias} size={18} />
            <store.Render path={`uptime.${alias}.display_name`}>
              {displayName => (
                <Label className="truncate route-display-name">{displayName || alias}</Label>
              )}
            </store.Render>
          </div>
          <Label className="text-sm">
            <RoutePercentageText alias={alias} />
          </Label>
        </div>
        <div className="mt-2">
          <RouteUptimeBar alias={alias} />
        </div>
      </a>
    </div>
  )
}

function RoutesUptimeProvider({
  sidebarRef,
}: {
  sidebarRef: React.RefObject<HTMLDivElement | null>
}) {
  useWebSocketApi<UptimeAggregate>({
    endpoint: '/metrics/uptime',
    query: {
      period: '1d',
    },
    onMessage: uptime => {
      const keys = uptime.data.map(route => route.alias)
      store.set('routeKeys', keys.toSorted())
      store.set(
        'uptime',
        uptime.data.reduce(
          (acc, route) => {
            acc[route.alias] = route
            return acc
          },
          {} as Record<string, RouteUptimeAggregate>
        )
      )

      const maxLength = Math.max(...uptime.data.map(route => route.alias.length))
      if (sidebarRef.current) sidebarRef.current.style.width = `${maxLength + 8}ch`
    },
    onError: toastError,
  })

  return null
}

function SelectedRouteResetter() {
  const selectedRoute = useSelectedRoute()
  const routeKeys = store.routeKeys.use()

  useEffect(() => {
    if (routeKeys && routeKeys.length > 0) {
      if (!selectedRoute || !routeKeys.some(route => route === selectedRoute)) {
        setSelectedRoute(routeKeys[0]!)
      }
    }
  }, [selectedRoute, routeKeys])

  return null
}

function ScrollIntoSelectedRoute() {
  const selectedRoute = useSelectedRoute()
  useEffect(() => {
    if (selectedRoute) {
      const el = document.getElementById(`route-${selectedRoute}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        el.setAttribute('data-active', 'true')
      }
    }
  }, [selectedRoute])

  return null
}
