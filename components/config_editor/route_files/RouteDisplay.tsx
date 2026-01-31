import { AppIcon } from '@/components/AppIcon'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { StoreCheckboxField } from '@/juststore-shadcn/src/components/store/Checkbox'
import type { Route as RouteResponse } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import type { CIDR } from '@/types/godoxy/types'
import { IconArrowRight, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react'
import isEqual from 'react-fast-compare'
import { routesConfigStore as store } from '../store'
import RouteIcon from './RouteIcon'
import * as utils from './utils'

export default function RouteDisplay({
  alias,
  route,
  details,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  alias: string
  route: Routes.Route
  details?: RouteResponse
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const listeningAddress = utils.getListeningAddress(route, details)
  const proxyAddress = utils.getProxyAddressOrRoot(route, details)

  const [iconBg, iconFg] = utils.getIconColorsByScheme(route.scheme)

  return (
    <div className="space-y-2.5">
      {/* Header with icon, title and edit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'shrink-0 rounded-lg p-1.5 border',
              iconBg, // fallback only
              'not-has-[svg]:bg-gray-500/30 not-has-[svg]:border-gray-500/20' // gray bg for app icon
            )}
          >
            <AppIcon
              alias={alias}
              className="size-4"
              fallback={
                <RouteIcon
                  scheme={route.scheme ?? 'http'}
                  className={iconFg}
                  data-slot="fallback"
                />
              }
            />
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
            <IconEdit className="size-4" />
          </Button>
          <Button title="Duplicate" variant="outline" size="sm" onClick={onDuplicate}>
            <IconCopy className="size-4" />
          </Button>
          <Button title="Delete" size="sm" variant="destructive" onClick={onDelete}>
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>

      {/* Connection details */}
      <div className="flex items-center gap-1 text-muted-foreground text-xs px-1 ml-9.5">
        {listeningAddress && (
          <>
            <span className="font-mono">{listeningAddress}</span>
            <IconArrowRight className="size-4" />
          </>
        )}
        <span className="font-mono">{proxyAddress}</span>
      </div>

      <Separator />
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
    <div className="flex flex-wrap md:grid md:grid-cols-2 gap-4 md:gap-2.5 rounded-md">
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
      <FieldLabel htmlFor="lan-only" className="text-xs">
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
      state={store.state(`configObject.${alias}.healthcheck.disable`).withDefault(false)}
      title="No Health Check"
      labelPlacement="right"
      labelProps={{ className: 'text-xs' }}
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
      state={store.state(`configObject.${alias}.homepage.show`).derived({
        from: value => value ?? true, // default to true if undefined
        to: value => !!value,
      })}
      title="Show on Dashboard"
      labelPlacement="right"
      labelProps={{ className: 'text-xs' }}
    />
  )
}
