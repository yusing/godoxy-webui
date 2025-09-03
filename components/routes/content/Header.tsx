'use client'
import { store, useSelectedRoute } from '@/components/routes/store'
import { Label } from '@/components/ui/label'
import { formatPercent } from '@/lib/format'
import { useMemo } from 'react'

export default function RoutePageHeader() {
  const selected = useSelectedRoute()
  const displayName = store.useValue(`uptime.${selected}.display_name`)
  const uptime = store.useValue(`uptime.${selected}.uptime`)
  const percentage = useMemo(() => (uptime ? formatPercent(uptime) : undefined), [uptime])

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
