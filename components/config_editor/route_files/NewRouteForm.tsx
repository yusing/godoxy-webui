import type { Routes } from '@/types/godoxy'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useEffect, useMemo } from 'react'
import { routesConfigStore } from '../store'
import RouteEditForm from './RouteEditForm'

function removeAlias(route: Routes.Route|undefined): Routes.Route {
  if (!route) return {}
  return {
    ...route,
    alias: undefined,
  }
}

function removeAliasRecursively(routes: Routes.Routes|undefined): Routes.Routes {
  if (!routes) return {}
  return Object.fromEntries(Object.entries(routes).map(([key, value]) => [key, removeAlias(value)]))
}

export default function NewRouteForm() {
  const [config, setConfig] = routesConfigStore.configObject.useState()

  const routes = useMemo(() => (typeof config === 'object' ? config : {}), [config])
  useEffect(() => {
    if (!routes) {
      routesConfigStore.validateError.set('Expecting routes objects')
    }
  }, [routes])

  const onSave = (route: Routes.Route) => {
    if (!route.alias) {
      // it should not happen because of form validation
      // but just in case
      routesConfigStore.validateError.set('Alias is required')
      return
    }
    setConfig({
      ...removeAliasRecursively(config),
      [route.alias]: removeAlias(route),
    })
  }

  return (
    <div className="rounded-md border border-border p-4">
      <RouteEditForm
        route={{}}
        alias=""
        onSave={onSave}
        onCancel={form => form.reset()}
        headerText="New Route"
        saveButtonIcon={IconPlus}
        saveButtonText="Create"
        cancelButtonIcon={IconRefresh}
        cancelButtonText="Reset"
        cancelButtonVariant="outline"
      />
    </div>
  )
}
