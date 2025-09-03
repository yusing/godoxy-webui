import { Card, CardContent } from '@/components/ui/card'
import type { Routes } from '@/types/godoxy'
import { useMemo, useState } from 'react'
import { routesConfigStore } from '../store'
import RouteDisplay from './RouteDisplay'
import RouteEditForm from './RouteEditForm'

export default function RouteList() {
  const [config, setConfig] = routesConfigStore.use('configObject')

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
      {Object.entries(routes ?? {}).map(([key, value]) => (
        <Card key={key}>
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

  if (isEditing) {
    return (
      <RouteEditForm
        alias={alias}
        route={route}
        onCancel={() => setIsEditing(false)}
        onSave={v => {
          setIsEditing(false)
          onSave(alias, v)
        }}
      />
    )
  }

  return (
    <RouteDisplay
      alias={alias}
      route={route}
      onEdit={() => setIsEditing(true)}
      onDuplicate={() => onDuplicate(alias)}
      onDelete={() => onDelete(alias)}
    />
  )
}
