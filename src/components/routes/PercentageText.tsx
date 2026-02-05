import { type RouteKey, store } from '@/components/routes/store'
import { formatPercent } from '@/lib/format'

export default function RoutePercentageText({ routeKey }: { routeKey: RouteKey }) {
  const health = store.uptime[routeKey]
  const uptime = health?.uptime.use() ?? 0
  const downtime = health?.downtime.use() ?? 0
  const idle = health?.idle.use() ?? 0
  if (uptime > 0) {
    return formatPercent(uptime) + ' UP'
  }
  if (downtime > 0) {
    return formatPercent(downtime) + ' DOWN'
  }
  if (idle > 0) {
    return formatPercent(idle) + ' IDLE'
  }
  return 'UNKNOWN'
}
