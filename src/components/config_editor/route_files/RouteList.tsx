import { useMemo, useState } from 'react'
import type { RouteKey } from '@/components/routes/store'
import { encodeRouteKey } from '@/components/routes/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import type { Routes } from '@/types/godoxy'
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
      <RouteDetailsProvider />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto h-full">
        {Object.entries(routes ?? {}).map(([key, value]) => (
          <Card key={key} className="p-2">
            <CardContent className="px-2">
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
          formatTitle={alias => (
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">Editing Route: </Label>
              <span className="font-semibold">{alias}</span>
            </div>
          )}
          onSave={v => {
            setIsEditing(false)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
