import { Link } from '@tanstack/react-router'
import { type ObjectState, Render, type ValueState } from 'juststore'
import { Gauge, Moon } from 'lucide-react'
import { forwardRef, useMemo } from 'react'
import type { HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { formatGoDuration, formatRoundedGoDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AppIcon } from '../AppIcon'
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu'
import AppItemContextMenuContent from './AppitemContextMenuContent'
import { CategoryIcon } from './CategoryIcon'
import HealthBadge from './HealthBadge'
import { store } from './store'

type AppItemProps = {
  categoryIndex: number
  appIndex: number
  visibleIndex: number
}

export default function AppItem({ categoryIndex, appIndex, visibleIndex }: AppItemProps) {
  const state = useMemo(
    () => store.homepageCategories.at(categoryIndex).items.at(appIndex),
    [categoryIndex, appIndex]
  )

  const handleClick = async () => {
    const alias = state.alias.value
    if (alias) {
      try {
        await api.homepage.itemClick({ which: alias })
      } catch (error) {
        console.warn('Failed to track item click:', error)
      }
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Render state={state.url}>
          {url => (
            <Link to={url} target="_blank" preload={false} onClick={handleClick}>
              <AppItemInner visibleIndex={visibleIndex} state={state} />
            </Link>
          )}
        </Render>
      </ContextMenuTrigger>
      <AppItemContextMenuContent state={state} categoryIndex={categoryIndex} itemIndex={appIndex} />
    </ContextMenu>
  )
}

const AppItemInner = forwardRef<
  HTMLButtonElement,
  { state: ObjectState<HomepageItem>; visibleIndex: number }
>(({ visibleIndex, state, ...props }, ref) => {
  const [alias, url, widgets, hasWidgets, category] = state.useCompute(item => [
    item.alias,
    item.url,
    item.widgets,
    Array.isArray(item.widgets) && item.widgets.length > 0,
    item.category,
  ])

  return (
    <button
      ref={ref}
      type="button"
      data-slot="card"
      className={cn(
        'app-item group w-full rounded-xl bg-card/35 backdrop-blur px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:from-background/95 hover:to-background/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
        'data-[active=true]:ring-2 data-[active=true]:ring-ring',
        'border border-border/30 shadow-sm'
      )}
      data-index={visibleIndex}
      data-url={url}
      data-alias={alias}
      /* initialize data-active for first item while searching */
      data-active={
        (visibleIndex === 0 && store.searchQuery.value) ||
        // NOTE: this is not a hook and is irrelevant to arrow navigation
        // only for preserving the ring on item order change
        store.navigation.activeItemIndex.value === visibleIndex
          ? 'true'
          : 'false'
      }
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 pt-0.5">
          <Render state={state.icon}>
            {icon => <ThemeAwareAppIcon alias={alias} url={icon || undefined} />}
          </Render>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          {/* Row 1: Name + Health */}
          <div className="flex items-center justify-between gap-2">
            <Render state={state.name}>
              {name => <span className="truncate text-sm font-medium">{name || alias}</span>}
            </Render>
            <Render state={store.state(`health.${alias}.status`)}>
              {status => <HealthBadge status={status} compact />}
            </Render>
          </div>

          {/* Row 2: Description */}
          <Render state={state.description}>
            {description =>
              description ? (
                <div className="truncate text-xs text-muted-foreground/90">{description}</div>
              ) : null
            }
          </Render>

          {/* Row 3: Category, latency, time until sleep, widgets */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground pt-0.5">
            <span className="inline-flex min-w-0 max-w-[100px] items-center gap-1">
              <span className="shrink-0" aria-hidden>
                <CategoryIcon category={category} className="size-3" />
              </span>
              <span className="truncate">{category}</span>
            </span>
            <LatencyText latency={store.state(`health.${alias}.latency`)} />
            <SleepCountdown sleepIn={store.state(`health.${alias}.sleep_in`)} />

            {hasWidgets &&
              widgets.map((widget, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="font-medium text-primary/90">{widget.value}</span>
                  <span className="opacity-70">{widget.label}</span>
                </span>
              ))}
          </div>
        </div>
      </div>
    </button>
  )
})

AppItemInner.displayName = 'AppItem'

function LatencyText({ latency }: { latency: ValueState<number> }) {
  const formatted = latency.useCompute(value => formatGoDuration(value))
  if (!formatted) {
    return null
  }
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Gauge className="size-3" aria-hidden />
      <span>{formatted}</span>
    </span>
  )
}

function SleepCountdown({ sleepIn }: { sleepIn: ValueState<number> }) {
  const formatted = sleepIn.useCompute(formatRoundedGoDuration)
  if (!formatted) {
    return null
  }
  return (
    <span
      className="inline-flex items-center gap-1 tabular-nums"
      aria-label={`Sleeps in ${formatted}`}
    >
      <Moon className="size-3" aria-hidden />
      <span>{formatted}</span>
    </span>
  )
}

function ThemeAwareAppIcon({ alias, url }: { alias: string; url?: string }) {
  const themeAware = store.ui.iconThemeAware.use()
  return <AppIcon className="size-6 sm:size-8" themeAware={themeAware} alias={alias} url={url} />
}
