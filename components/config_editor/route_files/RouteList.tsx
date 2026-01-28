import type { RouteKey } from '@/components/routes/store'
import { encodeRouteKey } from '@/components/routes/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import YAMLEditor from '@/components/YAMLEditor'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import type { Routes } from '@/types/godoxy'
import { createAtom } from 'juststore'
import { useId, useMemo, useState } from 'react'
import { stringify as stringifyYAML } from 'yaml'
import { configStore, routesConfigStore } from '../store'
import RouteDisplay from './RouteDisplay'
import RouteEditForm from './RouteEditForm'

export default function RouteList() {
  const [config, setConfig] = routesConfigStore.useState('configObject')

  const routes = useMemo(() => (typeof config === 'object' ? config : {}), [config])

  const onSave = (key: string, value: Routes.Route) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }
  const onDuplicate = (key: string) => {
    setConfig({
      ...config,
      [key + '-copy']: { ...config![key] },
    })
  }
  const onDelete = (key: string) => {
    const copy = { ...config }
    delete copy[key]
    setConfig(copy)
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      <RouteDetailsProvider />
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
  const editingRoute = createAtom(useId(), route)

  return (
    <>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="min-w-[90vw] min-h-[90vh]"
          showCloseButton={false}
          initialFocus={false}
        >
          <div className="grid grid-cols-[1fr_500px] gap-2">
            <ScrollArea className="h-[90vh]">
              <RouteEditForm
                alias={alias}
                route={editingRoute.value}
                dialog
                onCancel={() => setIsEditing(false)}
                onSave={v => {
                  setIsEditing(false)
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { alias: _, ...rest } = v // exclude alias from the saved route, we don't want this in route files
                  onSave(alias, rest)
                }}
                onUpdate={editingRoute.set}
              />
            </ScrollArea>
            <editingRoute.Render>
              {value => <YAMLEditor readOnly value={stringifyYAML(value)} />}
            </editingRoute.Render>
          </div>
        </DialogContent>
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
