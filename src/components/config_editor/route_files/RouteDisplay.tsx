import { isEqual, RenderWithUpdate } from 'juststore'
import {
  Activity,
  Copy,
  LayoutDashboard,
  Network,
  SquarePen,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { AppIcon } from '@/components/AppIcon'
import { Button } from '@/components/ui/button'
import type { Route as RouteResponse } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import type { CIDR } from '@/types/godoxy/types'
import { routesConfigStore as store } from '../store'
import RouteIcon from './RouteIcon'
import * as utils from './utils'

const routeCardActionVisibility = cn(
  'flex shrink-0 items-center transition-opacity duration-150',
  'opacity-100',
  '[@media(hover:hover)_and_(pointer:fine)]:opacity-0',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/card:opacity-100',
  '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within/card:opacity-100'
)

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

  const mappingLabel =
    listeningAddress != null && listeningAddress !== ''
      ? `${listeningAddress} -> ${proxyAddress}`
      : proxyAddress

  const [, iconFg] = utils.getIconColorsByScheme(route.scheme)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="mt-0.5 grid size-8 shrink-0 place-content-center rounded-md border border-border/80 bg-muted/30">
            <AppIcon
              alias={alias}
              className="size-3.5"
              fallback={
                <RouteIcon
                  scheme={route.scheme ?? 'http'}
                  className={cn('size-3.5', iconFg)}
                  data-slot="fallback"
                />
              }
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="route-display-name truncate text-sm font-medium leading-tight text-foreground">
              {alias}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-[0.6875rem] leading-snug">
              {utils.getRouteType(route.scheme) + (alias.startsWith('x-') ? ' Template' : '')}
            </p>
          </div>
        </div>
        <div className={cn(routeCardActionVisibility, 'gap-0.5')}>
          <Button title="Edit" variant="outline" size="icon-sm" onClick={onEdit}>
            <SquarePen className="size-3.5" />
          </Button>
          <Button title="Duplicate" variant="outline" size="icon-sm" onClick={onDuplicate}>
            <Copy className="size-3.5" />
          </Button>
          <Button title="Delete" size="icon-sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <QuickSettings alias={alias} />

      <p
        className="bg-muted/25 text-muted-foreground min-w-0 truncate rounded-md border border-border/50 px-2 py-1.5 font-mono text-[0.7rem] leading-normal tabular-nums"
        title={mappingLabel}
      >
        {mappingLabel}
      </p>
    </div>
  )
}

const DEFAULT_CIDR_ALLOW = [
  '192.168.0.0/16',
  '10.0.0.0/16',
  '127.0.0.1/32',
  '100.64.0.0/12',
] as CIDR[]

const settingChipBase = cn(
  'inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-[min(var(--radius-md),8px)] border border-border/35 bg-transparent px-1.5 py-1 text-[0.8125rem] font-medium',
  'text-muted-foreground/80 transition-[background-color,border-color,color,box-shadow,opacity]',
  'hover:border-border/60 hover:bg-muted/25 hover:text-foreground/95',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
  '[-webkit-tap-highlight-color:transparent]'
)

function QuickSettingChip({
  label,
  title,
  icon: Icon,
  active,
  onClick,
  mode = 'pressed',
  disabled,
  ariaChecked,
}: {
  label: string
  title: string
  icon: LucideIcon
  active: boolean
  onClick: () => void
  mode?: 'pressed' | 'checkbox'
  disabled?: boolean
  ariaChecked?: boolean | 'mixed'
}) {
  const checkbox = mode === 'checkbox'
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      {...(checkbox
        ? {
            role: 'checkbox' as const,
            'aria-checked': (ariaChecked ?? active) as boolean | 'mixed',
            disabled,
          }
        : { 'aria-pressed': active })}
      onClick={onClick}
      className={cn(
        settingChipBase,
        active && !disabled && 'text-foreground',
        checkbox &&
          disabled &&
          'border-dashed border-warning/40 bg-warning/10 text-muted-foreground'
      )}
    >
      <Icon
        className={cn(
          'size-3.5 shrink-0 transition-[color,opacity]',
          active && !disabled && 'text-primary',
          !active && !disabled && 'text-muted-foreground/75',
          disabled && 'text-warning/85'
        )}
        aria-hidden
      />
      <span className={cn('leading-snug', disabled && 'text-muted-foreground')}>{label}</span>
    </button>
  )
}

function QuickSettings({ alias }: { alias: string }) {
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-1">
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
  const [matchesDefault, hasCustom] = store.useCompute(
    `configObject.${alias}.middlewares.cidr_whitelist.allow`,
    m => {
      const allowMatchesDefault = isEqual(m, DEFAULT_CIDR_ALLOW)
      const allowHasCustom = Boolean(m) && !allowMatchesDefault
      return [allowMatchesDefault, allowHasCustom] as const
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

  const tip = hasCustom
    ? 'Custom CIDR whitelist — adjust in route settings'
    : matchesDefault
      ? 'Remove default CIDR whitelist'
      : 'Add default CIDR whitelist'

  return (
    <QuickSettingChip
      label="Private"
      title={tip}
      icon={Network}
      mode="checkbox"
      active={matchesDefault}
      disabled={hasCustom}
      ariaChecked={hasCustom ? 'mixed' : matchesDefault}
      onClick={() => handleChange(!matchesDefault)}
    />
  )
}

function HealthCheckToggle({ alias }: { alias: string }) {
  const state = store.state(`configObject.${alias}.healthcheck.disable`).withDefault(false)

  return (
    <RenderWithUpdate state={state}>
      {(value, update) => (
        <QuickSettingChip
          label="Healthcheck"
          title="No health check"
          icon={Activity}
          active={!value}
          onClick={() => update(!value)}
        />
      )}
    </RenderWithUpdate>
  )
}

function ShowOnDashboardToggle({ alias }: { alias: string }) {
  const isReverseProxy = store.useCompute(
    `configObject.${alias}.scheme`,
    s => utils.getRouteType(s) === 'Reverse Proxy'
  )
  const showState = store.state(`configObject.${alias}.homepage.show`).derived({
    from: value => value ?? true,
    to: value => !!value,
  })

  if (!isReverseProxy) {
    return null
  }

  return (
    <RenderWithUpdate state={showState}>
      {(value, update) => (
        <QuickSettingChip
          label="Dashboard"
          title="Show on dashboard"
          icon={LayoutDashboard}
          active={Boolean(value)}
          onClick={() => update(!value)}
        />
      )}
    </RenderWithUpdate>
  )
}
