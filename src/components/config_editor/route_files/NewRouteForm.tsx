import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Routes } from '@/types/godoxy'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useEffect, useMemo } from 'react'
import { configStore, routesConfigStore } from '../store'
import RouteEditFormDialogContent from './RouteEditFormDialog'

function removeAlias(route: Routes.Route | undefined): Routes.Route {
  if (!route) return {}
  return {
    ...route,
    alias: undefined,
  }
}

function removeAliasRecursively(routes: Routes.Routes | undefined): Routes.Routes {
  if (!routes) return {}
  return Object.fromEntries(Object.entries(routes).map(([key, value]) => [key, removeAlias(value)]))
}

export default function NewRouteForm({ isActive }: { isActive: boolean }) {
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
    <Dialog open={isActive} onOpenChange={open => !open && configStore.activeSection.reset()}>
      <RouteEditFormDialogContent
        route={{}}
        alias=""
        formatTitle={alias => (
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">New Route: </Label>
            <span className="font-semibold">{alias}</span>
          </div>
        )}
        saveButtonIcon={IconPlus}
        saveButtonText="Create"
        onSave={route => {
          configStore.activeSection.reset()
          onSave(route)
        }}
        secondActionButtonIcon={IconRefresh}
        secondActionButtonText="Reset"
        secondActionButtonVariant="outline"
        onSecondAction={() => {}}
      />
    </Dialog>
  )
}
