'use client'

import {
  setSelectedRoute,
  store,
  useSelectedRoute,
  type RouteDisplaySettings,
  type RouteKey,
} from '@/components/routes/store'
import { useWebSocketApi } from '@/hooks/websocket'
import type { RouteStatusesByAlias, RouteUptimeAggregate, UptimeAggregate } from '@/lib/api'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Suspense, useEffect, useRef } from 'react'
import { Label } from '../ui/label'
import RoutePercentageText from './PercentageText'
import RoutesSidebarSearchBox from './SearchBox'
import RouteUptimeBar from './UptimeBar'

import { IconFilter } from '@tabler/icons-react'
import type { FieldPath } from 'juststore'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AppIcon } from '../AppIcon'
import { Kbd } from '../ui/kbd'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { Switch } from '../ui/switch'
import './style.css'
import { decodeRouteKey, encodeRouteKey } from './utils'

export default function RoutesSidebar({ className }: { className?: string }) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={sidebarRef} className={cn('flex flex-col', className)}>
      <div className="sidebar-header sticky top-0 px-3 py-3 flex items-center justify-between border-x">
        <Label className="text-sm">Routes</Label>
        <Popover>
          <PopoverTrigger aria-label="Filters">
            <IconFilter className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <Setting field="dockerOnly" label="Docker only" />
            <Setting field="proxmoxOnly" label="Proxmox only" />
            <Setting field="hideUnknown" label="Hide unknown" />
            <Setting field="hideExcluded" label="Hide excluded (non-proxied)" />
            <Setting field="hideUptimebar" label="Hide uptime bar" />
          </PopoverContent>
        </Popover>
      </div>
      <RoutesSidebarSearchBox />
      <RoutesSidebarKeyboardHints />
      <RoutesSidebarItemList />
      <Suspense>
        <RoutesUptimeProvider sidebarRef={sidebarRef} />
      </Suspense>
      <SelectedRouteResetter />
      {/* <ScrollIntoSelectedRoute /> */}
      <RoutesSidebarArrowNavigation />
    </div>
  )
}

function isVisibleElement(element: HTMLElement | null) {
  return !!element && (element.offsetParent !== null || element.getClientRects().length > 0)
}

function getVisibleRouteItems() {
  // Sidebar is rendered twice for responsiveness, so we need to filter out the invisible elements
  // See app/routes/page.tsx
  return Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      '.sidebar-item-list .route-item:not([data-filtered="true"])'
    )
  ).filter(isVisibleElement)
}

function setActiveRouteByIndex(index: number) {
  const items = getVisibleRouteItems()
  if (items.length === 0) return

  const prevActive = document.querySelector('.route-item[data-active="true"]')
  if (prevActive) prevActive.removeAttribute('data-active')

  const clampedIndex = Math.max(0, Math.min(index, items.length - 1))
  const nextActive = items[clampedIndex]
  if (nextActive) {
    nextActive.setAttribute('data-active', 'true')
    nextActive.scrollIntoView({ block: 'nearest' })
  }
}

function handleRouteKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Tab': {
      e.preventDefault()
      break
    }
    case 'ArrowDown': {
      e.preventDefault()
      const items = getVisibleRouteItems()
      if (items.length === 0) return

      const currentIndex = items.findIndex(item => item.getAttribute('data-active') === 'true')
      if (currentIndex < 0) {
        setActiveRouteByIndex(0)
        break
      }
      if (currentIndex >= items.length - 1) return

      setActiveRouteByIndex(currentIndex + 1)
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      const items = getVisibleRouteItems()
      if (items.length === 0) return

      const currentIndex = items.findIndex(item => item.getAttribute('data-active') === 'true')
      const prevIndex = Math.max(currentIndex - 1, 0)
      setActiveRouteByIndex(prevIndex)
      break
    }
    case 'Enter': {
      e.preventDefault()
      const active = document.querySelector<HTMLAnchorElement>('.route-item[data-active="true"]')
      if (!active) return

      const routeId = active.id.replace('route-', '')
      if (!routeId) return

      setSelectedRoute(routeId as RouteKey)
      store.mobileDialogOpen.set(true)
      break
    }
    case 'Escape': {
      e.preventDefault()
      const active = document.querySelector('.route-item[data-active="true"]')
      if (active) active.removeAttribute('data-active')
      break
    }
  }
}

function RoutesSidebarArrowNavigation() {
  useEffect(() => {
    document.addEventListener('keydown', handleRouteKeyDown)
    return () => document.removeEventListener('keydown', handleRouteKeyDown)
  }, [])

  return null
}

function RoutesSidebarKeyboardHints() {
  return (
    <div className="sidebar-keyboard-hints border-x border-b px-3 py-2 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Kbd>
          <ArrowUp className="h-3 w-3" />
        </Kbd>
        <Kbd>
          <ArrowDown className="h-3 w-3" />
        </Kbd>
        <span>Move</span>
      </div>
      <div className="flex items-center gap-1">
        <Kbd>Enter</Kbd>
        <span>Select</span>
      </div>
      <div className="flex items-center gap-1">
        <Kbd>Esc</Kbd>
        <span>Clear</span>
      </div>
      <div className="flex items-center gap-1">
        <Kbd>A-Z</Kbd>
        <span>Search</span>
      </div>
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
          return <RoutesSidebarItem key={key} routeKey={key} alias={decodeRouteKey(key)} />
        })}
      </div>
    </ScrollArea>
  )
}

function RoutesSidebarItem({ alias, routeKey }: { alias: string; routeKey: RouteKey }) {
  const [hideUnknown, hideExcluded, dockerOnly, proxmoxOnly] = store.displaySettings.useCompute(
    settings => [
      settings.hideUnknown,
      settings.hideExcluded,
      settings.dockerOnly,
      settings.proxmoxOnly,
    ]
  )
  const currentStatus = store.uptime[routeKey]?.current_status.use()
  const [isDocker, isProxmox, displayName, excluded] = store.routeDetails[routeKey]!.useCompute(
    details => {
      if (!details) return [false, false, '', false]
      return [
        Boolean(details.container),
        Boolean(details.proxmox),
        details.homepage.name,
        details.excluded,
      ]
    }
  )

  const hideUptimebarState = store.displaySettings.hideUptimebar

  if (hideUnknown && (!currentStatus || currentStatus === 'unknown')) return null
  if (hideExcluded && excluded) return null
  if (dockerOnly && !isDocker) return null
  if (proxmoxOnly && !isProxmox) return null

  return (
    <div className="flex flex-col">
      <a
        id={`route-${routeKey}`}
        // href={`#${key}`}
        target="_self"
        onClick={() => {
          setSelectedRoute(routeKey)
          store.mobileDialogOpen.set(true)
        }}
        className={cn(
          'route-item text-left p-3 transition-colors border-x border-b',
          'data-[filtered=true]:hidden',
          'data-[active=true]:bg-accent data-[active=true]:border-2 data-[active=true]:border-primary',
          'hover:bg-muted/50'
        )}
      >
        <div className="flex justify-between items-center gap-4 flex-1">
          <div className="mt-0.5 flex items-center gap-2">
            <AppIcon alias={alias} size={18} />
            <Label className="route-display-name">{displayName || alias}</Label>
          </div>
          <hideUptimebarState.Render>
            {hideUptimebar => (
              <Label className={cn('text-sm', hideUptimebar && 'w-[10ch] text-right')}>
                <RoutePercentageText routeKey={routeKey} />
              </Label>
            )}
          </hideUptimebarState.Render>
        </div>
        <RouteUptimeBar routeKey={routeKey} className="mt-2" />
      </a>
    </div>
  )
}

function RoutesUptimeProvider({
  sidebarRef,
}: {
  sidebarRef: React.RefObject<HTMLDivElement | null>
}) {
  useWebSocketApi<RouteStatusesByAlias>({
    endpoint: '/metrics/uptime',
    onMessage: uptime => {
      const keys = Object.keys(uptime.statuses ?? {}).map(k => encodeRouteKey(k))
      store.set('routeKeys', keys.toSorted())

      const maxLength = Math.max(...keys.map(k => k.length))
      if (sidebarRef.current) sidebarRef.current.style.width = `${maxLength + 8}ch`
    },
    onError: toastError,
  })

  useWebSocketApi<UptimeAggregate>({
    endpoint: '/metrics/uptime',
    query: {
      period: '1h',
    },
    onMessage: uptime => {
      store.set(
        'uptime',
        uptime.data.reduce(
          (acc, route) => {
            acc[encodeRouteKey(route.alias)] = route
            return acc
          },
          {} as Record<RouteKey, RouteUptimeAggregate>
        )
      )
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

// function ScrollIntoSelectedRoute() {
//   const selectedRoute = useSelectedRoute()
//   useEffect(() => {
//     if (selectedRoute) {
//       const el = document.getElementById(`route-${selectedRoute}`)
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth' })
//         el.setAttribute('data-active', 'true')
//       }
//     }
//   }, [selectedRoute])

//   return null
// }
