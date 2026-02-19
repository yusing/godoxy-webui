import { type RouteKey, store } from '@/components/routes/store'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import { parseProxmoxStatsLine } from './proxmox_stats'
import '@/stats_bar.css'

type StatsCellConfig = {
  label: string
  getValue: () => string | null | undefined
  className: string
  minWidth?: string
}

type StatsBarProps = {
  cells: StatsCellConfig[]
  isVisible: boolean
  splitAfter?: number
}

const statsCellBackgroundVarByClass: Record<string, string> = {
  'ds-status': '--ds-status-bg',
  'ds-status-stopped': '--ds-status-stopped-bg',
  'ds-running': '--ds-running-bg',
  'ds-running-no': '--ds-running-no-bg',
  'ds-cpu': '--ds-cpu-bg',
  'ds-mem-usage': '--ds-mem-usage-bg',
  'ds-mem-percent': '--ds-mem-percent-bg',
  'ds-net': '--ds-net-bg',
  'ds-block': '--ds-block-bg',
  'ds-rootfs': '--ds-rootfs-bg',
  'ds-rootfs-percent': '--ds-rootfs-percent-bg',
  'ds-pve': '--ds-pve-bg',
  'ds-kernel': '--ds-kernel-bg',
  'ds-cpu-model': '--ds-cpu-model-bg',
  'ds-load': '--ds-load-bg',
  'ds-uptime': '--ds-uptime-bg',
}

function getTranslucentCellStyle(cell: StatsCellConfig) {
  const bgVar = statsCellBackgroundVarByClass[cell.className]
  const backgroundColor = bgVar
    ? `color-mix(in oklab, var(${bgVar}) 10%, transparent)`
    : 'color-mix(in oklab, var(--card) 32%, transparent)'

  return {
    minWidth: cell.minWidth,
    backgroundColor,
    backdropFilter: 'blur(8px) saturate(120%)',
    WebkitBackdropFilter: 'blur(8px) saturate(120%)',
  } as const
}

function formatPercent(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const clamped = Math.max(0, Math.min(100, value))
  return `${clamped.toFixed(clamped < 10 ? 1 : 0)}%`
}

function StatsCell({ cell }: { cell: StatsCellConfig }) {
  return (
    <div
      style={getTranslucentCellStyle(cell)}
      data-slot="stats-cell"
      className={cn(
        'flex flex-col gap-0.5 rounded-lg border border-white/10 px-2 py-1.5 shadow-sm',
        'text-[10px] text-muted-foreground',
        cell.className
      )}
    >
      <div className="text-[9px] uppercase tracking-wide whitespace-nowrap">{cell.label}</div>
      <div className="text-[11px] font-medium text-foreground whitespace-nowrap tabular-nums">
        {cell.getValue() ?? '—'}
      </div>
    </div>
  )
}

function StatsRow({ cells }: { cells: StatsCellConfig[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {cells.map(cell => (
        <StatsCell key={cell.label} cell={cell} />
      ))}
    </div>
  )
}

export function StatsBar({ cells, isVisible, splitAfter }: StatsBarProps) {
  if (!isVisible) return null

  const line1 = splitAfter ? cells.slice(0, splitAfter) : cells
  const line2 = splitAfter ? cells.slice(splitAfter) : []

  return (
    <div className="space-y-2">
      <StatsRow cells={line1} />
      {line2.length > 0 && <StatsRow cells={line2} />}
    </div>
  )
}

export function ContainerStatsBar({ routeKey }: { routeKey: RouteKey }) {
  const isDocker = store.routeDetails[routeKey]?.useCompute(details => Boolean(details?.container))
  const isProxmox = store.routeDetails[routeKey]?.useCompute(details => Boolean(details?.proxmox))

  const dockerStats = store.dockerStats[routeKey]?.use()
  const lxcRawStats = store.proxmoxStats[routeKey]?.use()
  const nodeStats = store.proxmoxNodeStats[routeKey]?.use()

  // Lazy import to avoid circular dependency
  const lxcStats = lxcRawStats ? parseProxmoxStatsLine(lxcRawStats) : null

  if (!isDocker && !isProxmox) return null

  if (isDocker && dockerStats) {
    const cells: StatsCellConfig[] = [
      {
        label: 'RUNNING',
        getValue: () => (dockerStats.running ? 'Yes' : 'No'),
        className: dockerStats.running ? 'ds-running' : 'ds-running-no',
        minWidth: '3rem',
      },
      {
        label: 'CPU %',
        getValue: () => formatPercent(dockerStats.cpuPercent),
        className: 'ds-cpu',
        minWidth: '3.5rem',
      },
      {
        label: 'MEM USAGE / LIMIT',
        getValue: () =>
          `${formatBytes(dockerStats.memoryUsage)} / ${formatBytes(dockerStats.memoryLimit)}`,
        className: 'ds-mem-usage',
        minWidth: '8rem',
      },
      {
        label: 'MEM %',
        getValue: () => formatPercent(dockerStats.memoryPercent),
        className: 'ds-mem-percent',
        minWidth: '3.5rem',
      },
      {
        label: 'NET I/O',
        getValue: () =>
          `${formatBytes(dockerStats.networkRx)} / ${formatBytes(dockerStats.networkTx)}`,
        className: 'ds-net',
        minWidth: '8rem',
      },
      {
        label: 'BLOCK I/O',
        getValue: () =>
          `${formatBytes(dockerStats.blockRead)} / ${formatBytes(dockerStats.blockWrite)}`,
        className: 'ds-block',
        minWidth: '8rem',
      },
    ]
    return <StatsBar cells={cells} isVisible={true} />
  }

  if (isProxmox && lxcStats) {
    const isRunning = lxcStats.status === 'running'
    const cells: StatsCellConfig[] = [
      {
        label: 'Status',
        getValue: () => lxcStats.status,
        className: isRunning ? 'ds-status' : 'ds-status-stopped',
        minWidth: '4rem',
      },
      {
        label: 'CPU %',
        getValue: () => lxcStats.cpuPercent,
        className: 'ds-cpu',
        minWidth: '3.5rem',
      },
      {
        label: 'MEM USAGE / TOTAL',
        getValue: () => lxcStats.memoryUsageAndLimit,
        className: 'ds-mem-usage',
        minWidth: '8rem',
      },
      {
        label: 'MEM %',
        getValue: () => lxcStats.memoryPercent,
        className: 'ds-mem-percent',
        minWidth: '3.5rem',
      },
      {
        label: 'NET I/O',
        getValue: () => lxcStats.networkRxTx,
        className: 'ds-net',
        minWidth: '8rem',
      },
      {
        label: 'BLOCK I/O',
        getValue: () => lxcStats.blockReadWrite,
        className: 'ds-block',
        minWidth: '8rem',
      },
    ]
    return <StatsBar cells={cells} isVisible={true} />
  }

  // Proxmox node stats (no VMID = node itself)
  if (isProxmox && nodeStats) {
    const cells: StatsCellConfig[] = [
      {
        label: 'UPTIME',
        getValue: () => nodeStats.uptime,
        className: 'ds-uptime',
        minWidth: '5rem',
      },
      {
        label: 'PVE',
        getValue: () => nodeStats.pve_version,
        className: 'ds-pve',
      },
      {
        label: 'KERNEL',
        getValue: () => nodeStats.kernel_version,
        className: 'ds-kernel',
      },
      {
        label: 'CPU MODEL',
        getValue: () => nodeStats.cpu_model,
        className: 'ds-cpu-model',
      },
      {
        label: 'CPU',
        getValue: () => nodeStats.cpu_usage,
        className: 'ds-cpu',
        minWidth: '3.5rem',
      },
      {
        label: 'MEM USAGE / TOTAL',
        getValue: () => `${nodeStats.mem_usage} / ${nodeStats.mem_total}`,
        className: 'ds-mem-usage',
        minWidth: '8rem',
      },
      {
        label: 'MEM %',
        getValue: () => nodeStats.mem_pct,
        className: 'ds-mem-percent',
        minWidth: '3.5rem',
      },
      {
        label: 'ROOTFS',
        getValue: () => `${nodeStats.rootfs_usage} / ${nodeStats.rootfs_total}`,
        className: 'ds-rootfs',
        minWidth: '7.5rem',
      },
      {
        label: 'ROOTFS %',
        getValue: () => nodeStats.rootfs_pct,
        className: 'ds-rootfs-percent',
        minWidth: '3.5rem',
      },
      {
        label: 'LOAD AVG',
        getValue: () =>
          `${nodeStats.load_avg_1m}, ${nodeStats.load_avg_5m}, ${nodeStats.load_avg_15m}`,
        className: 'ds-load',
        minWidth: '6.5rem',
      },
    ]
    return <StatsBar cells={cells} isVisible={true} splitAfter={4} />
  }

  return null
}
