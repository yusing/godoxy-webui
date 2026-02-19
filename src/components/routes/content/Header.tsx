import { store, useSelectedRoute } from '@/components/routes/store'
import { Label } from '@/components/ui/label'
import { formatPercent } from '@/lib/format'
import { decodeRouteKey } from '../utils'
import ContainerControls from './ContainerControls'
import { ContainerStatsBar } from './StatsBar'

export default function RoutePageHeader() {
  const selected = useSelectedRoute()
  const displayName = store.routeDetails[selected]?.homepage.name.use()
  const percentage = store.uptime[selected]?.uptime.useCompute(uptime =>
    uptime ? formatPercent(uptime) : undefined
  )
  if (!selected) {
    return null
  }

  return (
    <div id="header" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">
          {displayName ?? decodeRouteKey(selected)}
        </h1>
        {percentage && (
          <div className="flex items-center gap-2 flex-wrap rounded-md border border-border/40 bg-muted/40 px-3 py-1.5">
            <Label className="text-sm font-mono text-muted-foreground">
              {percentage} uptime (1h)
            </Label>
          </div>
        )}
        <ContainerControls routeKey={selected} />
      </div>
      <ContainerStatsBar routeKey={selected} />
    </div>
  )
}
