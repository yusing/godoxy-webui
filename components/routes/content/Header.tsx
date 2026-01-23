'use client'
import { store, useSelectedRoute } from '@/components/routes/store'
import { Label } from '@/components/ui/label'
import { formatPercent } from '@/lib/format'
import { decodeRouteKey } from '../utils'
import DockerStatsBar from './DockerStatsBar'

export default function RoutePageHeader() {
  const selected = useSelectedRoute()
  const displayName = store.uptime[selected]?.display_name.use()
  const isDockerState = store.uptime[selected]!.is_docker
  const percentage = store.uptime[selected]?.uptime.useCompute(uptime =>
    uptime ? formatPercent(uptime) : undefined
  )
  if (!selected) {
    return null
  }

  return (
    <div id="header" className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold">{displayName ?? decodeRouteKey(selected)}</h1>
        {percentage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm text-muted-foreground">{percentage} uptime (1h)</Label>
            {/* {isDocker && <DockerStatsBar routeKey={selected} />} */}
          </div>
        )}
      </div>
      <isDockerState.Show on={isDocker => isDocker}>
        <DockerStatsBar routeKey={selected} />
      </isDockerState.Show>
    </div>
  )
}
