import { type RouteKey, store } from '@/components/routes/store'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function RoutePercentageText({ routeKey }: { routeKey: RouteKey }) {
  const health = store.uptime[routeKey]
  const uptime = health?.uptime.use() ?? 0
  const downtime = health?.downtime.use() ?? 0
  const idle = health?.idle.use() ?? 0
  if (uptime > 0) {
    return <span className={cn('text-emerald-500')}>{formatPercent(uptime)} UP</span>
  }
  if (downtime > 0) {
    return <span className={cn('text-rose-500')}>{formatPercent(downtime)} DOWN</span>
  }
  if (idle > 0) {
    return <span className={cn('text-amber-500')}>{formatPercent(idle)} IDLE</span>
  }
  return <span className="text-muted-foreground">UNKNOWN</span>
}
