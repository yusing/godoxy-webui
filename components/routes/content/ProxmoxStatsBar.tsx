'use client'

import { store, type RouteKey } from '@/components/routes/store'
import { cn } from '@/lib/utils'
import { parseProxmoxStatsLine } from './proxmox_stats'
import './stats_bar.css'

export default function DockerStatsBar({ routeKey }: { routeKey: RouteKey }) {
  const stats = store.proxmoxStats[routeKey]?.useCompute(line => parseProxmoxStatsLine(line ?? ''))
  const isProxmox = store.routeDetails[routeKey]!.proxmox.useCompute(proxmox => Boolean(proxmox))

  if (!stats || !isProxmox) return null

  const cells = [
    {
      label: 'Status',
      value: stats ? stats.status : '—',
      className: 'ds-running',
    },
    {
      label: 'CPU %',
      value: stats.cpuPercent,
      className: 'ds-cpu',
    },
    {
      label: 'MEM USAGE / LIMIT',
      value: stats.memoryUsageAndLimit,
      className: 'ds-mem-usage',
    },
    {
      label: 'MEM %',
      value: stats.memoryPercent,
      className: 'ds-mem-percent',
    },
    {
      label: 'NET I/O',
      value: stats.networkRxTx,
      className: 'ds-net',
    },
    {
      label: 'BLOCK I/O',
      value: stats.blockReadWrite,
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
