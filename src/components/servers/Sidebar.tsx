import {
  Activity,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Cpu,
  HardDrive,
  Server,
  Thermometer,
} from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { useFragment } from '@/hooks/fragment'
import type { DiskUsageStat } from '@/lib/api'
import { formatBytes, formatShortTime, formatTemperature } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AddAgentDialogButton } from './NewAgentButton'
import { store, useSensorsInfo } from './store'

export default function ServersSidebar() {
  const agentList = store.agentList.use() ?? []
  const selectedAgent = useFragment()
  const selected = selectedAgent || undefined
  const selectedKey = selected || 'GoDoxy'
  const selectedTimestamp = store.use(`systemInfo.${selectedKey}.timestamp`)

  return (
    <aside className="flex w-full flex-col border-b border-border/60 xl:h-full xl:w-[382px] xl:min-w-[340px] xl:max-w-[420px] xl:border-r xl:border-b-0">
      <div className="border-b border-border/60 p-3 xl:hidden">
        <details className="group rounded-xl border border-border/70 bg-card/40">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Server className="size-4 text-primary" />
              <span className="truncate text-lg font-semibold">{selected ?? 'GoDoxy'}</span>
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  selectedTimestamp ? 'bg-(--ds-running-bg)' : 'bg-(--ds-status-stopped-bg)'
                )}
              />
            </div>
            <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="space-y-2 border-t border-border/60 px-2 pb-2 pt-2">
            <div className="flex items-center justify-between rounded-lg bg-card/40 px-2 py-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Controls
              </span>
              <div className="flex items-center gap-2">
                <CpuTemperatureToggle />
                <AddAgentDialogButton className="h-8 rounded-lg border-border/80 bg-card/50 px-2.5 text-xs hover:bg-card/80" />
              </div>
            </div>
            <ServerList agentList={agentList} selected={selected} />
          </div>
        </details>
      </div>

      <div className="hidden items-center justify-between border-b border-border/60 px-4 py-3 xl:flex">
        <h2 className="text-lg font-semibold tracking-tight">Servers</h2>
        <div className="flex items-center gap-2">
          <CpuTemperatureToggle />
          <AddAgentDialogButton className="h-8 rounded-lg border-border/80 bg-card/50 px-2 text-xs hover:bg-card/80" />
        </div>
      </div>

      <div className="hidden px-3 py-3 xl:block">
        <ServerList agentList={agentList} selected={selected} />
      </div>
    </aside>
  )
}

function ServerList({ agentList, selected }: { agentList: string[]; selected?: string }) {
  return (
    <div className="space-y-3">
      <ServerItem isSelected={!selected} />
      {agentList.map(agent => (
        <ServerItem key={agent} agent={agent} isSelected={selected === agent} />
      ))}
    </div>
  )
}

function ServerItem({ agent, isSelected }: { agent?: string; isSelected?: boolean }) {
  const agentKey = agent || 'GoDoxy'
  const temperatureUnit = store.temperatureUnit.use()
  const { cpuTemp, diskTemp, cpuTempStatus, diskTempStatus } = useSensorsInfo(agentKey)
  const cpu = store.useCompute(`systemInfo.${agentKey}.cpu_average`, value => formatPercent(value))
  const memory = store.useCompute(`systemInfo.${agentKey}.memory`, value => formatMemory(value))
  const disk = store.useCompute(`systemInfo.${agentKey}.disks`, value => formatTopDiskShort(value))
  const upload = store.useCompute(`systemInfo.${agentKey}.network.upload_speed`, value =>
    value === undefined || value === null ? '—' : formatBytes(value, { precision: 0, unit: '/s' })
  )
  const download = store.useCompute(`systemInfo.${agentKey}.network.download_speed`, value =>
    value === undefined || value === null ? '—' : formatBytes(value, { precision: 0, unit: '/s' })
  )
  const timestamp = store.use(`systemInfo.${agentKey}.timestamp`)

  const temperatureValue =
    cpuTemp === null && diskTemp === null
      ? '—'
      : `${cpuTemp === null ? '—' : formatTemperature(cpuTemp, temperatureUnit)} / ${diskTemp === null ? '—' : formatTemperature(diskTemp, temperatureUnit)}`

  return (
    <a
      href={`#${agent ?? ''}`}
      className={cn(
        'block cursor-pointer rounded-2xl border px-4 py-3.5 transition-colors duration-200 hover:border-primary/40 hover:bg-muted',
        isSelected && 'border-primary/70'
      )}
      style={{
        borderColor: isSelected
          ? 'color-mix(in oklab, var(--primary) 62%, transparent)'
          : 'color-mix(in oklab, var(--border) 65%, transparent)',
        boxShadow: isSelected
          ? '0 0 0 1px color-mix(in oklab, var(--primary) 28%, transparent)'
          : undefined,
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                'size-2.5 rounded-full',
                timestamp ? 'bg-(--ds-running-bg)' : 'bg-(--ds-status-stopped-bg)'
              )}
            />
            <span className="truncate text-md leading-none font-semibold">{agentKey}</span>
          </div>
          <span className="rounded-md bg-card/70 supports-backdrop-filter:bg-card/45 px-2 py-0.5 text-xs text-muted-foreground text-nowrap">
            {timestamp ? `@ ${formatShortTime(timestamp)}` : '—'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <SidebarMetric
            label="CPU"
            value={cpu}
            icon={Cpu}
            iconTone="var(--ds-block-bg)"
            valueClassName="text-foreground"
          />
          <SidebarMetric
            label="Up"
            value={upload}
            icon={ArrowUp}
            iconTone="var(--ds-text-running)"
            valueClassName="text-(--ds-text-running)"
          />
          <SidebarMetric
            label="Mem"
            value={memory}
            icon={Activity}
            iconTone="var(--ds-net-bg)"
            valueClassName="text-foreground"
          />
          <SidebarMetric
            label="Down"
            value={download}
            icon={ArrowDown}
            iconTone="var(--ds-text-net)"
            valueClassName="text-(--ds-text-net)"
          />
          <SidebarMetric
            label="Disk"
            value={disk}
            icon={HardDrive}
            iconTone="var(--ds-mem-percent-bg)"
            valueClassName="text-foreground"
          />
          <SidebarMetric
            label="Temp"
            value={temperatureValue}
            icon={Thermometer}
            iconTone="var(--ds-status-stopped-bg)"
            valueClassName={cn(
              'text-foreground',
              (cpuTempStatus === 'critical' || diskTempStatus === 'critical') && 'text-error',
              (cpuTempStatus === 'warning' || diskTempStatus === 'warning') && 'text-warning'
            )}
          />
        </div>
      </div>
    </a>
  )
}

function CpuTemperatureToggle() {
  const [temperatureUnit, setTemperatureUnit] = store.temperatureUnit.useState()

  const UNIT_OPTIONS = [
    { label: '°C', value: 'celsius' },
    { label: '°F', value: 'fahrenheit' },
  ] as const

  return (
    <fieldset
      aria-label="Temperature unit"
      className="inline-flex h-8 items-center rounded-lg border border-border/70 bg-card/60 supports-backdrop-filter:bg-card/45 p-1"
    >
      {UNIT_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={temperatureUnit === opt.value}
          onClick={() => setTemperatureUnit(opt.value)}
          className={cn(
            'h-6 min-w-8 cursor-pointer rounded-md px-2 text-xs font-medium transition-colors duration-200',
            temperatureUnit === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </fieldset>
  )
}

function SidebarMetric({
  icon: Icon,
  label,
  value,
  iconTone,
  valueClassName,
}: {
  icon: ElementType
  label: string
  value: ReactNode
  iconTone: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className="size-3.5 shrink-0" style={{ color: iconTone }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div
        className={cn('truncate text-right text-xs font-semibold tabular-nums', valueClassName)}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
    </div>
  )
}

function formatPercent(n?: number | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  const v = Math.max(0, Math.min(100, n))
  return `${v.toFixed(v < 10 ? 1 : 0)}%`
}

function formatTopDiskShort(disks: Record<string, DiskUsageStat> | undefined): string {
  if (!disks) return '—'
  const values = Object.values(disks)
  if (values.length === 0) return '—'

  const root = values.find(e => e.path === '/') || values[0]!
  return `${formatPercent(root.used_percent)}`
}

function formatMemory(memory: { used: number; total: number } | null | undefined): string {
  if (!memory) return '—'
  const gb = 1024 ** 3
  const used = Math.round(memory.used / gb)
  const total = Math.max(1, Math.round(memory.total / gb))
  return `${used}/${total} GB`
}
