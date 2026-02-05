import { type ReactNode, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { MetricsPeriod, SystemInfoAggregateMode } from '@/lib/api'
import { store } from '../store'

function formatTimestampAsTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatTimestampAsDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

const colorMap: Record<string, string> = {
  download: 'var(--chart-1)',
  upload: 'var(--chart-5)',
  cpu_average: 'var(--chart-2)',
  memory_usage: 'var(--chart-4)',
}

function color(key: string) {
  if (!colorMap[key]) {
    const idx = (Object.keys(colorMap).length % 5) + 1
    colorMap[key] = `var(--chart-${idx})`
  }
  return colorMap[key]
}

function getTimestampTicks(data: Record<string, unknown>[], period: MetricsPeriod) {
  if (!data.length) return [] as number[]
  const every = Math.max(
    1,
    Math.floor(data.length / (period === '1d' || period === '1mo' ? 15 : 10))
  )
  return data
    .map((item, index) => {
      if (index % every === 0) return item.timestamp as number
      return null
    })
    .filter((item): item is number => item !== null)
}

export default function MetricChart({
  period,
  type,
  label,
  description,
  agent,
  yAxisFormatter,
}: {
  period: MetricsPeriod
  type: SystemInfoAggregateMode
  label: string
  description: string
  agent: string
  yAxisFormatter: (value: number) => string
}) {
  const agg = store.use(`systemInfoGraphs.${agent}.${period}.${type}.data`) ?? []

  const hasData = agg && agg.length > 0

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {!hasData ? (
        <div className="text-sm text-muted-foreground">Not enough data for the period.</div>
      ) : (
        <ChartInner data={agg} yAxisFormatter={yAxisFormatter} />
      )}
    </div>
  )
}

function ChartInner({
  data,
  yAxisFormatter,
}: {
  data: Record<string, unknown>[]
  yAxisFormatter: (value: number) => string
}) {
  const keys = useMemo(
    () => (data.length ? Object.keys(data[0]!).filter(k => k !== 'timestamp') : []),
    [data]
  )

  const chartConfig: ChartConfig = useMemo(() => {
    const entries: [string, { label: string; color: string }][] = keys.map(k => [
      k,
      { label: k, color: color(k) },
    ])
    return Object.fromEntries(entries)
  }, [keys])

  const maxHeight = `${280 + keys.length * 10}px`

  const period = store.metricsPeriod.use()
  const formatter = useMemo(
    () => (period === '1d' || period === '1mo' ? formatTimestampAsDate : formatTimestampAsTime),
    [period]
  )

  const timestampTicks = useMemo(() => getTimestampTicks(data, period), [data, period])

  return (
    <ChartContainer className="w-full" style={{ maxHeight }} config={chartConfig}>
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent valueFormatter={yAxisFormatter as (value: unknown) => ReactNode} />
          }
        />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tickMargin={15}
          axisLine={false}
          tickFormatter={formatter}
          ticks={timestampTicks}
        />
        <YAxis tickFormatter={yAxisFormatter} axisLine={true} />
        {keys.length > 1 && <ChartLegend verticalAlign="bottom" className="flex-wrap flex" />}
        {keys.map(name => (
          <Area
            key={name}
            dataKey={name}
            type="monotone"
            stroke={color(name)}
            strokeWidth={2}
            fill={color(name)}
            fillOpacity={0.2}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
