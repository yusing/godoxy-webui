import { store } from '@/components/routes/store'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function RoutePercentageText({ routeKey }: { routeKey: string }) {
  const [uptime, downtime, idle] = store.useCompute(
    'uptime',
    data => [data[routeKey]?.uptime ?? 0, data[routeKey]?.downtime ?? 0, data[routeKey]?.idle ?? 0],
    [routeKey]
  )
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
