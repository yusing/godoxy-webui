'use client'

import { store, type RouteKey } from '@/components/routes/store'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import { parseProxmoxStatsLine } from './proxmox_stats'
import './stats_bar.css'

type StatsCellConfig = {
  label: string
  getValue: () => string | null | undefined
  className: string
}

type StatsBarProps = {
  cells: StatsCellConfig[]
  isVisible: boolean
}

function formatPercent(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const clamped = Math.max(0, Math.min(100, value))
  return `${clamped.toFixed(clamped < 10 ? 1 : 0)}%`
}

export function StatsBar({ cells, isVisible }: StatsBarProps) {
  if (!isVisible) return null

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
            {cell.getValue() ?? '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ContainerStatsBar({ routeKey }: { routeKey: RouteKey }) {
  const isDocker = store.routeDetails[routeKey]?.useCompute(details => Boolean(details?.container))
  const isProxmox = store.routeDetails[routeKey]?.useCompute(details => Boolean(details?.proxmox))

  const dockerStats = store.dockerStats[routeKey]?.use()
  const proxmoxRawStats = store.proxmoxStats[routeKey]?.use()

  // Lazy import to avoid circular dependency
  const proxmoxStats = proxmoxRawStats ? parseProxmoxStatsLine(proxmoxRawStats) : null

  if (!isDocker && !isProxmox) return null

  if (isDocker && dockerStats) {
    const cells: StatsCellConfig[] = [
      {
        label: 'RUNNING',
        getValue: () => (dockerStats.running ? 'Yes' : 'No'),
        className: 'ds-running',
      },
      {
        label: 'CPU %',
        getValue: () => formatPercent(dockerStats.cpuPercent),
        className: 'ds-cpu',
      },
      {
        label: 'MEM USAGE / LIMIT',
        getValue: () =>
          `${formatBytes(dockerStats.memoryUsage)} / ${formatBytes(dockerStats.memoryLimit)}`,
        className: 'ds-mem-usage',
      },
      {
        label: 'MEM %',
        getValue: () => formatPercent(dockerStats.memoryPercent),
        className: 'ds-mem-percent',
      },
      {
        label: 'NET I/O',
        getValue: () =>
          `${formatBytes(dockerStats.networkRx)} / ${formatBytes(dockerStats.networkTx)}`,
        className: 'ds-net',
      },
      {
        label: 'BLOCK I/O',
        getValue: () =>
          `${formatBytes(dockerStats.blockRead)} / ${formatBytes(dockerStats.blockWrite)}`,
        className: 'ds-block',
      },
    ]
    return <StatsBar cells={cells} isVisible={true} />
  }

  if (isProxmox && proxmoxStats) {
    const cells: StatsCellConfig[] = [
      {
        label: 'Status',
        getValue: () => proxmoxStats.status,
        className: 'ds-running',
      },
      {
        label: 'CPU %',
        getValue: () => proxmoxStats.cpuPercent,
        className: 'ds-cpu',
      },
      {
        label: 'MEM USAGE / LIMIT',
        getValue: () => proxmoxStats.memoryUsageAndLimit,
        className: 'ds-mem-usage',
      },
      {
        label: 'MEM %',
        getValue: () => proxmoxStats.memoryPercent,
        className: 'ds-mem-percent',
      },
      {
        label: 'NET I/O',
        getValue: () => proxmoxStats.networkRxTx,
        className: 'ds-net',
      },
      {
        label: 'BLOCK I/O',
        getValue: () => proxmoxStats.blockReadWrite,
        className: 'ds-block',
      },
    ]
    return <StatsBar cells={cells} isVisible={true} />
  }

  return null
}
