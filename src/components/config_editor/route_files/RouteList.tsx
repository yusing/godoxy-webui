import { useMemo, useState } from 'react'
import RoutesSidebarSearchBox from '@/components/routes/SearchBox'
import type { RouteKey } from '@/components/routes/store'
import { encodeRouteKey } from '@/components/routes/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import type { Routes } from '@/types/godoxy'
import { ConfigHeaderTitle } from '../ConfigHeaderActions'
import { configStore, routesConfigStore } from '../store'
import RouteDisplay from './RouteDisplay'
import RouteEditFormDialogContent from './RouteEditFormDialog'

export default function RouteList() {
  const [config, setConfig] = routesConfigStore.useState('configObject')
  const routes = useMemo(() => (config && typeof config === 'object' ? config : {}), [config])

  const onSave = (key: string, value: Routes.Route) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }
  const onDuplicate = (key: string) => {
    setConfig({
      [`${key}-copy`]: { ...config?.[key] },
      ...config,
    })
  }
  const onDelete = (key: string) => {
    const copy = { ...config }
    delete copy[key]
    setConfig(copy)
  }

  return (
    <>
      <ConfigHeaderTitle>
        <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 text-xl font-bold">
          <span>Route List</span>
          <RoutesSidebarSearchBox
            itemListRootClass="config-route-list"
            className="px-0 py-0 w-full min-w-0 sm:w-56 sm:max-w-xs text-base font-normal"
          />
        </span>
      </ConfigHeaderTitle>
      <RouteDetailsProvider />
      <div className="config-route-list grid grid-cols-1 xl:grid-cols-2 gap-4 px-0.5 overflow-y-auto h-full">
        {Object.entries(routes ?? {}).map(([key, value]) => (
          <Card key={key} size="sm" className="route-item">
            <CardContent>
              <RouteCardContent
                alias={key}
                route={value ?? {}}
                onSave={onSave}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function RouteCardContent({
  alias,
  route,
  onSave,
  onDuplicate,
  onDelete,
}: {
  alias: string
  route: Routes.Route
  onSave: (key: string, value: Routes.Route) => void
  onDuplicate: (key: string) => void
  onDelete: (key: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <RouteEditFormDialogContent
          alias={alias}
          route={route}
          formatTitle={_alias => (
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">Editing Route: </Label>
              <span className="font-semibold">{_alias}</span>
            </div>
          )}
          onSave={v => {
            setIsEditing(false)
            const { alias: _, ...rest } = v // exclude alias from the saved route, we don't want this in route files
            onSave(alias, rest)
          }}
          onSecondAction={() => setIsEditing(false)}
        />
      </Dialog>
      <RouteDisplay
        alias={alias}
        route={route}
        onEdit={() => setIsEditing(true)}
        onDuplicate={() => onDuplicate(alias)}
        onDelete={() => onDelete(alias)}
      />
    </>
  )
}

function RouteDetailsProvider() {
  useWebSocketApi<Route[]>({
    endpoint: '/route/list',
    onMessage: data => {
      configStore.routeDetails.set(
        data.reduce(
          (acc, route) => {
            acc[encodeRouteKey(route.alias)] = route
            return acc
          },
          {} as Record<RouteKey, Route>
        )
      )
    },
  })
  return null
}
