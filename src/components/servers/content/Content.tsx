import { IconCheck, IconX } from '@tabler/icons-react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Cpu,
  Globe,
  HardDrive,
  MemoryStick,
  Thermometer,
  Wifi,
} from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { Suspense, useCallback, useMemo } from 'react'
import SystemInfoGraphsProvider from '@/components/servers/content/SystemInfoGraphsProvider'
import VersionText from '@/components/VersionText'
import { useFragment } from '@/hooks/fragment'
import { useDelta, usePercentageDelta } from '@/hooks/use-delta'
import type { DiskUsageStat, MetricsPeriod, SystemInfo } from '@/lib/api'
import { formatBytes, formatTemperature } from '@/lib/format'
import { cn } from '@/lib/utils'
import { store, useSensorsInfo } from '../store'
import MetricChart from './Charts'

const DS_TONE = {
  'bg-running': 'var(--ds-running-bg)',
  'bg-block': 'var(--ds-block-bg)',
  'bg-net': 'var(--ds-net-bg)',
  'bg-mem': 'var(--ds-mem-percent-bg)',
  'bg-stopped': 'var(--ds-status-stopped-bg)',
  'bg-pve': 'var(--ds-pve-bg)',
  'text-muted': 'var(--ds-text-muted)',
  'text-running': 'var(--ds-text-running)',
  'text-block': 'var(--ds-text-block)',
  'text-stopped': 'var(--ds-text-status-stopped)',
} as const

const PERIOD_OPTIONS: Array<{ label: string; value: MetricsPeriod }> = [
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '5m', value: '5m' },
  { label: '24h', value: '1d' },
  { label: '30d', value: '1mo' },
]

export default function ServerContent() {
  return (
    <div className="scrollbar-hidden flex-1 overflow-y-auto p-3 sm:p-4">
      <SystemInfoGraphsPage />
    </div>
  )
}

function SystemInfoGraphsPage() {
  const selectedAgent = useFragment()
  const agent = useMemo(() => selectedAgent || 'Main Server', [selectedAgent])
  const displayName = selectedAgent?.replaceAll('%20', ' ') || 'GoDoxy'

  const period = store.metricsPeriod.use()
  const temperatureUnit = store.temperatureUnit.use()

  const byteSizeFormatter = useCallback((value: number) => formatBytes(value, { precision: 0 }), [])
  const speedFormatter = useCallback(
    (value: number) => formatBytes(value, { precision: 0, unit: '/s' }),
    []
  )
  const iopsFormatter = useCallback((value: number) => `${value} IOPS`, [])
  const percentageFormatter = useCallback(
    (value: number) => `${Math.round(value * 100) / 100}%`,
    []
  )
  const temperatureFormatter = useCallback(
    (value: number) => formatTemperature(value, temperatureUnit),
    [temperatureUnit]
  )

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Suspense>
        <SystemInfoGraphsProvider agent={agent} period={period} />
      </Suspense>

      <div className="rounded-2xl border border-border/60 bg-card dark:bg-[color-mix(in_oklab,var(--card)_65%,black)] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg leading-none font-semibold tracking-tight">{displayName}</h2>
              <ServerVersionBadge agent={agent} />
              <ServerStreamBadge
                agent={agent}
                selectedAgent={selectedAgent}
                label="TCP Stream"
                tone="tcp"
                field="supports_tcp_stream"
              />
              <ServerStreamBadge
                agent={agent}
                selectedAgent={selectedAgent}
                label="UDP Stream"
                tone="udp"
                field="supports_udp_stream"
              />
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="size-4" />
              <ServerAddrText agent={agent} />
            </div>
          </div>

          <div className="flex w-full justify-end md:w-auto md:flex-none">
            <PeriodPills value={period} onChange={next => store.metricsPeriod.set(next)} />
          </div>
        </div>

        <SummaryCards agent={agent} selectedAgent={selectedAgent} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MetricChart
          period={period}
          type="cpu_average"
          label="CPU Usage"
          description="Average CPU usage of the system"
          yAxisFormatter={percentageFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="memory_usage"
          label="Memory Usage"
          description="Memory usage of the system"
          yAxisFormatter={byteSizeFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="disks_read_speed"
          label="Disk Read Speed"
          description="Disk read speed by device"
          yAxisFormatter={speedFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="disks_write_speed"
          label="Disk Write Speed"
          description="Disk write speed by device"
          yAxisFormatter={speedFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="disks_iops"
          label="Disk IOPS"
          description="Disk IOPS by device"
          yAxisFormatter={iopsFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="disk_usage"
          label="Disk Usage"
          description="Disk usage by partition"
          yAxisFormatter={byteSizeFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="network_speed"
          label="Network Speed"
          description="Overall network speed of the system"
          yAxisFormatter={speedFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="network_transfer"
          label="Network Transfer"
          description="Overall network transfer of the system"
          yAxisFormatter={byteSizeFormatter}
          agent={agent}
        />
        <MetricChart
          period={period}
          type="sensor_temperature"
          label="Temperature"
          description="Sensor temperature by device"
          yAxisFormatter={temperatureFormatter}
          agent={agent}
        />
      </div>
    </div>
  )
}

function ServerVersionBadge({ agent }: { agent: string }) {
  const version = store.useCompute(`agents.${agent}.version`, value => normalizeVersion(value))
  const cn = 'inline-flex h-7 items-center rounded-2xl border px-2 font-mono text-xs'
  const style = {
    backgroundColor: `color-mix(in oklab, ${DS_TONE['bg-pve']} 36%, var(--card))`,
    borderColor: `color-mix(in oklab, ${DS_TONE['bg-pve']} 58%, transparent)`,
    color: DS_TONE['text-muted'],
  }
  return version ? (
    <span className={cn} style={style}>
      {version}
    </span>
  ) : (
    <span className={cn} style={style}>
      <VersionText className="text-current" />
    </span>
  )
}

function ServerStreamBadge({
  agent,
  selectedAgent,
  label,
  tone,
  field,
}: {
  agent: string
  selectedAgent?: string
  label: string
  tone: 'tcp' | 'udp'
  field: 'supports_tcp_stream' | 'supports_udp_stream'
}) {
  const supported = store.useCompute(
    `agents.${agent}`,
    value => {
      const agentInfo = value as
        | {
            supports_tcp_stream?: boolean
            supports_udp_stream?: boolean
          }
        | undefined
      return !selectedAgent || Boolean(agentInfo?.[field])
    },
    [selectedAgent, field]
  )
  return <StreamBadge label={label} supported={supported} tone={tone} />
}

function ServerAddrText({ agent }: { agent: string }) {
  const addr = store.useCompute(`agents.${agent}.addr`, value => value || 'localhost')
  return <span className="text-sm">{addr}</span>
}

function SummaryCards({ agent, selectedAgent }: { agent: string; selectedAgent?: string }) {
  const dataAgent = store.useCompute(
    `systemInfo.${agent}`,
    value => (!selectedAgent && !value ? 'GoDoxy' : agent),
    [selectedAgent, agent]
  )

  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
      <CpuSummaryCard agent={dataAgent} />
      <MemorySummaryCard agent={dataAgent} />
      <DiskSummaryCard agent={dataAgent} />
      <NetworkSummaryCard agent={dataAgent} />
      <TemperatureSummaryCard agent={dataAgent} />
    </div>
  )
}

function CpuSummaryCard({ agent }: { agent: string }) {
  const cpuCurrent = store.useCompute(`systemInfo.${agent}.cpu_average`, value =>
    typeof value === 'number' && Number.isFinite(value) ? value : null
  )
  const cpuDelta = useDelta(cpuCurrent, agent)
  const cpuUsage = formatPercent(cpuCurrent ?? undefined)
  const cpuStatus = formatCpuDelta(cpuDelta)

  return (
    <SummaryCard
      label="CPU"
      value={cpuUsage}
      status={cpuUsage === '—' ? '--' : cpuStatus}
      statusTone={deltaToneCN(cpuDelta)}
      icon={Cpu}
      tone={DS_TONE['bg-block']}
      iconTone={DS_TONE['bg-block']}
    />
  )
}

function MemorySummaryCard({ agent }: { agent: string }) {
  const memory = store.use(`systemInfo.${agent}.memory`)
  const memoryUsage = memory ? formatBytes(memory.used, { precision: 0 }) : '—'
  const memoryStatus = memory ? 'stable' : '--'

  return (
    <SummaryCard
      label="Memory"
      value={memoryUsage}
      status={memoryStatus}
      icon={MemoryStick}
      tone={DS_TONE['bg-net']}
      iconTone={DS_TONE['bg-net']}
    />
  )
}

function DiskSummaryCard({ agent }: { agent: string }) {
  const disks = store.use(`systemInfo.${agent}.disks`)
  const diskUsage = formatRootDiskPercent(disks)
  const diskStatus = disks ? 'rootfs' : '--'

  return (
    <SummaryCard
      label="Disk"
      value={diskUsage}
      status={diskStatus}
      icon={HardDrive}
      tone={DS_TONE['bg-mem']}
      iconTone={DS_TONE['bg-mem']}
    />
  )
}

function NetworkSummaryCard({ agent }: { agent: string }) {
  const [hasNetwork, ioSpeed] = store.useCompute(`systemInfo.${agent}.network`, value => [
    Boolean(value),
    value?.upload_speed + value?.download_speed,
  ])

  const networkSpeed = hasNetwork
    ? formatBytes(ioSpeed, {
        precision: 0,
        unit: '/s',
      })
    : '—'
  const networkDelta = usePercentageDelta(ioSpeed, agent)
  const networkStatus = networkDelta === undefined ? '--' : formatDiskDelta(networkDelta)
  const NetworkTrendIcon =
    networkDelta !== undefined && networkDelta < 0 ? ArrowDownLeft : ArrowUpRight
  const networkTrendTone = deltaToneCN(networkDelta ? -networkDelta : undefined)

  return (
    <SummaryCard
      label="Network"
      value={networkSpeed}
      status={
        networkStatus === '--' ? (
          networkStatus
        ) : (
          <span className="inline-flex items-center gap-1">
            <NetworkTrendIcon className="size-3.5" />
            {networkStatus}
          </span>
        )
      }
      statusTone={networkTrendTone}
      icon={Wifi}
      tone={DS_TONE['bg-running']}
      iconTone={DS_TONE['bg-running']}
    />
  )
}

function TemperatureSummaryCard({ agent }: { agent: string }) {
  const temperatureUnit = store.temperatureUnit.use()
  const { cpuTemp, cpuTempStatus } = useSensorsInfo(agent)
  const tempDelta = useDelta(cpuTemp ?? undefined, agent)

  const temperatureValue = cpuTemp === null ? 'N/A' : formatTemperature(cpuTemp, temperatureUnit)
  const temperatureStatus =
    cpuTemp === null
      ? '--'
      : tempDelta !== undefined
        ? formatTemperatureDelta(tempDelta, temperatureUnit)
        : cpuTempStatus === 'critical'
          ? 'critical'
          : cpuTempStatus === 'warning'
            ? 'warning'
            : 'stable'
  const statusTone =
    tempDelta !== undefined ? deltaToneCN(-tempDelta) : temperatureStatusToneCN(cpuTempStatus)

  return (
    <SummaryCard
      label="Temperature"
      value={temperatureValue}
      status={temperatureStatus}
      icon={Thermometer}
      tone={DS_TONE['bg-stopped']}
      iconTone={DS_TONE['bg-stopped']}
      statusTone={statusTone}
    />
  )
}

function StreamBadge({
  label,
  supported,
  tone,
}: {
  label: string
  supported: boolean
  tone: 'tcp' | 'udp'
}) {
  const baseTone = tone === 'tcp' ? DS_TONE['bg-running'] : DS_TONE['bg-block']
  const baseTextTone = tone === 'tcp' ? DS_TONE['text-running'] : DS_TONE['text-block']
  const appliedTone = supported ? baseTone : DS_TONE['bg-stopped']
  const appliedTextTone = supported ? baseTextTone : DS_TONE['text-stopped']

  return (
    <span
      className="inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold"
      style={{
        backgroundColor: `color-mix(in oklab, ${appliedTone} 34%, var(--card))`,
        borderColor: `color-mix(in oklab, ${appliedTone} 58%, transparent)`,
        color: appliedTextTone,
      }}
    >
      {supported ? <IconCheck className="size-3" /> : <IconX className="size-3" />}
      {label}
    </span>
  )
}

function PeriodPills({
  value,
  onChange,
}: {
  value: MetricsPeriod
  onChange: (p: MetricsPeriod) => void
}) {
  return (
    <div className="inline-flex h-10 items-center rounded-xl border border-border/70 bg-card/60 p-1">
      {PERIOD_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 min-w-10 cursor-pointer rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === option.value && 'bg-primary text-primary-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  status,
  icon: Icon,
  tone,
  iconTone,
  statusTone,
}: {
  label: string
  value: string
  status: ReactNode
  icon: ElementType
  tone: string
  iconTone: string
  statusTone?: string
}) {
  return (
    <div
      className="min-h-[86px] rounded-2xl border px-3 py-2.5 md:min-h-[94px] md:px-3.5 md:py-2.5"
      style={{
        backgroundColor: `color-mix(in oklab, ${tone} 30%, var(--card))`,
        borderColor: `color-mix(in oklab, ${tone} 44%, transparent)`,
      }}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5" style={{ color: iconTone }} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span className={cn('tabular-nums truncate text-xs text-muted-foreground', statusTone)}>
          {status}
        </span>
      </div>
      <div className="tabular-nums text-xl leading-none font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function deltaToneCN(delta: number | null | undefined): string | undefined {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return undefined
  return delta > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
}

function temperatureStatusToneCN(
  status: 'critical' | 'warning' | 'stable' | null | undefined
): string | undefined {
  if (status === 'critical') return 'text-red-500 dark:text-red-400'
  if (status === 'warning') return 'text-yellow-500 dark:text-yellow-400'
  return undefined
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—'
  const clamped = Math.max(0, Math.min(100, value))
  return `${clamped.toFixed(clamped < 10 ? 1 : 0)}%`
}

function formatCpuDelta(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return '--'
  const absolute = Math.abs(delta)
  const precision = absolute < 10 ? 1 : 0
  return `${delta >= 0 ? '+' : '-'}${absolute.toFixed(precision)}%`
}

function formatTemperatureDelta(delta: number, unit: 'celsius' | 'fahrenheit'): string {
  if (Number.isNaN(delta)) return '--'
  const display = unit === 'fahrenheit' ? delta * 1.8 : delta
  const absolute = Math.abs(display)
  const precision = absolute < 10 ? 1 : 0
  const suffix = unit === 'fahrenheit' ? '°F' : '°C'
  return `${delta >= 0 ? '+' : '-'}${absolute.toFixed(precision)}${suffix}`
}

function formatRootDiskPercent(
  disks: SystemInfo['disks'] | Record<string, DiskUsageStat> | undefined
): string {
  if (!disks) return '—'
  const entries = Object.values(disks)
  if (entries.length === 0) return '—'
  const root = entries.find(disk => disk.path === '/') || entries[0]
  return root ? formatPercent(root.used_percent) : '—'
}

function formatDiskDelta(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return '--'
  const absolute = Math.abs(delta)
  const precision = absolute < 10 ? 1 : 0
  return `${delta >= 0 ? '+' : '-'}${absolute.toFixed(precision)} %`
}

function normalizeVersion(version: string | undefined): string | undefined {
  if (!version) return undefined
  return version.startsWith('v') ? version : `v${version}`
}
