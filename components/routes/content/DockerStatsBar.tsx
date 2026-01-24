'use client'

import { store, type RouteKey } from '@/components/routes/store'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import './stats_bar.css'

function formatPercent(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const clamped = Math.max(0, Math.min(100, value))
  return `${clamped.toFixed(clamped < 10 ? 1 : 0)}%`
}

export default function DockerStatsBar({ routeKey }: { routeKey: RouteKey }) {
  const stats = store.dockerStats[routeKey]?.use()
  const isDocker = store.routeDetails[routeKey]!.container.useCompute(container =>
    Boolean(container)
  )

  if (!isDocker) return null

  const cells = [
    {
      label: 'RUNNING',
      value: stats ? (stats.running ? 'Yes' : 'No') : '—',
      className: 'ds-running',
    },
    {
      label: 'CPU %',
      value: stats ? formatPercent(stats.cpuPercent) : '—',
      className: 'ds-cpu',
    },
    {
      label: 'MEM USAGE / LIMIT',
      value: stats ? `${formatBytes(stats.memoryUsage)} / ${formatBytes(stats.memoryLimit)}` : '—',
      className: 'ds-mem-usage',
    },
    {
      label: 'MEM %',
      value: stats ? formatPercent(stats.memoryPercent) : '—',
      className: 'ds-mem-percent',
    },
    {
      label: 'NET I/O',
      value: stats ? `${formatBytes(stats.networkRx)} / ${formatBytes(stats.networkTx)}` : '—',
      className: 'ds-net',
    },
    {
      label: 'BLOCK I/O',
      value: stats ? `${formatBytes(stats.blockRead)} / ${formatBytes(stats.blockWrite)}` : '—',
      className: 'ds-block',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {cells.map(cell => (
        <div
          key={cell.label}
          className={cn(
            'flex flex-col gap-0.5 rounded-md px-2 py-1',
            'text-[10px] text-muted-foreground',
            cell.className
          )}
        >
          <div className="text-[9px] uppercase tracking-wide whitespace-nowrap">{cell.label}</div>
          <div className="text-[11px] font-medium text-foreground whitespace-nowrap">
            {cell.value}
          </div>
        </div>
      ))}
    </div>
  )
}
