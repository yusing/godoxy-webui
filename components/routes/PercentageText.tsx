import { store } from '@/components/routes/store'
import { formatPercent } from '@/lib/format'

export default function RoutePercentageText({ alias }: { alias: string }) {
  const uptime = store.useValue(`uptime.${alias}.uptime`) ?? 0
  const downtime = store.useValue(`uptime.${alias}.downtime`) ?? 0
  const idle = store.useValue(`uptime.${alias}.idle`) ?? 0
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
