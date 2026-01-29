import { GoDoxyErrorAlert, type GoDoxyError } from '@/components/GoDoxyError'
import type { RouteKey } from '@/components/routes/store'
import { encodeRouteKey } from '@/components/routes/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import YAMLEditor from '@/components/YAMLEditor'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Route } from '@/lib/api'
import { type Routes } from '@/types/godoxy'
import { IconCircleCheck } from '@tabler/icons-react'
import { createAtom, type Atom } from 'juststore'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { stringify as stringifyYAML } from 'yaml'
import { configStore, routesConfigStore } from '../store'
import RouteDisplay from './RouteDisplay'
import RouteEditForm from './RouteEditForm'

export default function RouteList() {
  const [config, setConfig] = routesConfigStore.useState('configObject')
  const sendRouteRef = useRef<((yaml: Routes.Route) => void) | null>(null)
  const id = useId()
  const errorAtom = createAtom<GoDoxyError | undefined>(`route-error-${id}`, undefined)

  const routes = useMemo(() => (typeof config === 'object' ? config : {}), [config])

  const onSave = (key: string, value: Routes.Route) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }
  const onDuplicate = (key: string) => {
    setConfig({
      [key + '-copy']: { ...config![key] },
      ...config,
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
      <RouteValidationProvider sendRouteRef={sendRouteRef} errorAtom={errorAtom} />
      {Object.entries(routes ?? {}).map(([key, value]) => (
        <Card key={key} className="p-2">
          <CardContent className="px-2">
            <RouteCardContent
              alias={key}
              route={value ?? {}}
              onSave={onSave}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              sendRouteRef={sendRouteRef}
              errorAtom={errorAtom}
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
  sendRouteRef,
  errorAtom,
}: {
  alias: string
  route: Routes.Route
  onSave: (key: string, value: Routes.Route) => void
  onDuplicate: (key: string) => void
  onDelete: (key: string) => void
  sendRouteRef: React.RefObject<((yaml: Routes.Route) => void) | null>
  errorAtom: Atom<GoDoxyError | undefined>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const id = useId()
  const editingRoute = createAtom(`editing-route-${id}`, route)

  return (
    <>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="min-w-[90vw] min-h-[90vh]"
          showCloseButton={false}
          initialFocus={false}
        >
          <div className="grid grid-cols-[1fr_1px_500px] gap-2">
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
                onUpdate={v => {
                  editingRoute.set(v)
                  sendRouteRef.current?.(v)
                }}
              />
            </ScrollArea>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-2">
              <Label className="pl-2 text-sm">Read-only Preview</Label>
              <editingRoute.Render>
                {value => <YAMLEditor readOnly value={stringifyYAML(value)} className="flex-1" />}
              </editingRoute.Render>
              <RouteErrorAlert errAtom={errorAtom} />
            </div>
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

function RouteErrorAlert({ errAtom }: { errAtom: Atom<GoDoxyError | undefined> }) {
  const err = errAtom.use()
  if (!err)
    return (
      <Alert variant="success">
        <IconCircleCheck />
        <AlertTitle>Valid</AlertTitle>
        <AlertDescription>The configuration is valid.</AlertDescription>
      </Alert>
    )
  return <GoDoxyErrorAlert title="Error" err={err} />
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

function RouteValidationProvider({
  sendRouteRef,
  errorAtom,
}: {
  sendRouteRef: React.RefObject<((yaml: Routes.Route) => void) | null>
  errorAtom: Atom<GoDoxyError | undefined>
}) {
  const { sendMessage } = useWebSocketApi({
    endpoint: '/route/validate',
    deduplicate: false,
    onMessage: data => {
      if (data && typeof data === 'object' && 'error' in data) {
        errorAtom.set(data.error as GoDoxyError)
      } else {
        errorAtom.reset()
      }
    },
  })

  useEffect(() => {
    sendRouteRef.current = (yaml: Routes.Route) => {
      sendMessage(stringifyYAML(yaml))
    }
  }, [sendRouteRef, sendMessage])

  return null
}
