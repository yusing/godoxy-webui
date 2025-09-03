'use client'

import { store, useSelectedRoute } from '@/components/routes/store'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { MetricsPeriod } from '@/lib/api'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  latency: {
    label: 'Latency',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function formatChartTimestamp(d: number, period: MetricsPeriod) {
  if (period === '1h') {
    return new Date(d).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
  }
  if (period === '1d') {
    return new Date(d).toLocaleString('en-US', {
      day: 'numeric',
      hour: 'numeric',
    })
  }
  if (period === '1mo') {
    return new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
  // 5m, 15m
  return new Date(d).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

function RouteResponseTimeChart() {
  const selected = useSelectedRoute()
  const statuses = store.useValue(`uptime.${selected}.statuses`) ?? []

  if (!selected) {
    return null
  }

  return (
    <ChartContainer className="max-h-40 w-full" config={chartConfig}>
      <AreaChart accessibilityLayer data={statuses ?? []}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={d => formatChartTimestamp(d, '1h')}
        />
        <YAxis
          domain={[0, (dataMax: number) => dataMax * 1.5]}
          tickLine={false}
          axisLine={false}
          tickFormatter={lat => `${lat} ms`}
        />
        <Area
          dataKey="latency"
          type="monotone"
          fill="var(--color-latency)"
          fillOpacity={0.2}
          stroke="var(--color-latency)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default RouteResponseTimeChart
