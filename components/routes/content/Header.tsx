'use client'
import { store, useSelectedRoute } from '@/components/routes/store'
import { Label } from '@/components/ui/label'
import { formatPercent } from '@/lib/format'

export default function RoutePageHeader() {
  const selected = useSelectedRoute()
  const displayName = store.uptime[selected]?.display_name.use()
  const percentage = store.uptime[selected]?.uptime.useCompute(uptime =>
    uptime ? formatPercent(uptime) : undefined
  )
  if (!selected) {
    return null
  }

  return (
    <div id="header" className="flex items-baseline gap-3">
      <h1 className="text-lg font-semibold">{displayName ?? selected}</h1>
      {percentage && (
        <Label className="text-sm text-muted-foreground">{percentage} uptime (1h)</Label>
      )}
    </div>
  )
}
