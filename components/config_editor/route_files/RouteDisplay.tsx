import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { StoreCheckboxField } from '@/juststore-shadcn/src/components/store/Checkbox'
import { isEqual } from '@/juststore/src/impl'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import type { CIDR } from '@/types/godoxy/types'
import type { State } from 'juststore'
import { ArrowRight, Copy, Edit2, Globe, Trash } from 'lucide-react'
import { routesConfigStore as store } from '../store'
import RouteIcon from './RouteIcon'
import * as utils from './utils'

export default function RouteDisplay({
  alias,
  route,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  alias: string
  route: Routes.Route
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const listeningAddress = utils.getListeningAddress(route)
  const proxyAddress = utils.getProxyAddressOrRoot(route)

  const [iconColor, textColor] = utils.getIconColorsByScheme(route.scheme)

  return (
    <div className="space-y-2.5">
      {/* Header with icon, title and edit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('shrink-0 rounded-lg p-1.5 border', iconColor)}>
            <RouteIcon scheme={route.scheme ?? 'http'} className={cn(`size-4`, textColor)} />
          </div>
          <div>
            <h3 className="font-semibold text">{alias}</h3>
            <p className="text-muted-foreground text-xs">
              {utils.getRouteType(route.scheme) + (alias.startsWith('x-') ? ' Template' : '')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button title="Edit" variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button title="Duplicate" variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button title="Delete" size="sm" variant="destructive" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection details */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Globe className="h-4 w-4" />

        {listeningAddress && (
          <>
            <span className="font-mono">{listeningAddress}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
        <span className="font-mono">{proxyAddress}</span>
      </div>

      <QuickSettings alias={alias} />
    </div>
  )
}

const DEFAULT_CIDR_ALLOW = [
  '192.168.0.0/16',
  '10.0.0.0/16',
  '127.0.0.1/32',
  '100.64.0.0/12',
] as CIDR[]

function QuickSettings({ alias }: { alias: string }) {
  return (
    <div className="flex flex-wrap gap-4 bg-card py-1 px-2 rounded-md">
      <LANOnlyToggle alias={alias} />
      <HealthCheckToggle alias={alias} />
      <ShowOnDashboardToggle alias={alias} />
    </div>
  )
}

function LANOnlyToggle({ alias }: { alias: string }) {
  const isReverseProxy = store.useCompute(
    `configObject.${alias}.scheme`,
    s => utils.getRouteType(s) === 'Reverse Proxy'
  )
  const [matchesDefault, hasCustom, ariaChecked] = store.useCompute(
    `configObject.${alias}.middlewares.cidr_whitelist.allow`,
    m => {
      const matchesDefault = isEqual(m, DEFAULT_CIDR_ALLOW)
      const hasCustom = m && !matchesDefault
      return [
        matchesDefault,
        hasCustom,
        hasCustom ? 'mixed' : matchesDefault ? 'true' : 'false',
      ] as const
    }
  )

  const handleChange = (checked: boolean) => {
    if (checked) {
      if (matchesDefault) {
        return
      }
      store.set(`configObject.${alias}.middlewares.cidr_whitelist.allow`, DEFAULT_CIDR_ALLOW)
    } else {
      store.reset(`configObject.${alias}.middlewares.cidr_whitelist`)
    }
  }

  if (!isReverseProxy) {
    return null
  }

  return (
    <Field
      orientation="horizontal"
      title={
        hasCustom
          ? undefined
          : matchesDefault
            ? 'Remove default CIDR whitelist'
            : 'Add default CIDR whitelist'
      }
      className="w-auto shrink-0"
    >
      <Checkbox
        id="lan-only"
        checked={matchesDefault}
        disabled={hasCustom}
        onCheckedChange={handleChange}
        aria-checked={ariaChecked}
      />
      <FieldLabel htmlFor="lan-only">
        LAN Only
        {hasCustom && (
          <p className="text-xs text-muted-foreground">
            Custom CIDR whitelist detected, manual update is required
          </p>
        )}
      </FieldLabel>
    </Field>
  )
}

function HealthCheckToggle({ alias }: { alias: string }) {
  return (
    <StoreCheckboxField
      state={store.configObject![alias]!.healthcheck.disable}
      title="No Health Check"
      labelPlacement="right"
    />
  )
}

function ShowOnDashboardToggle({ alias }: { alias: string }) {
  const isReverseProxy = store.useCompute(
    `configObject.${alias}.scheme`,
    s => utils.getRouteType(s) === 'Reverse Proxy'
  )
  if (!isReverseProxy) {
    return null
  }
  return (
    <StoreCheckboxField
      state={
        (store.state(`configObject.${alias}.homepage.show`) as State<boolean>).derived({
          from: value => value ?? true, // default to true if undefined
          to: value => !!value,
        }) as State<boolean>
      }
      title="Show on Dashboard"
      labelPlacement="right"
    />
  )
}
