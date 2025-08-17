"use client";
import { PeriodsSelect } from "@/components/metrics/periods_select";
import { useTemperatureUnit } from "@/components/metrics/settings";
import { EmptyState } from "@/components/ui/empty-state";
import { useWebSocketApi } from "@/hooks/websocket";
import type {
  MetricsPeriod,
  SystemInfoAggregate,
  SystemInfoAggregateMode,
} from "@/lib/api";
import { formatByte, toFahrenheit } from "@/lib/format";
import { Chart as ChakraChart, useChart } from "@chakra-ui/charts";
import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuGlobe } from "react-icons/lu";
import { useEffectOnce } from "react-use";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Label } from "../ui/label";

type Agent = {
  name: string;
  addr?: string;
};

const byteSizeFormatter = (value: number) => formatByte(value, 0);
const speedFormatter = (value: number) => `${byteSizeFormatter(value)}/s`;
const iopsFormatter = (value: number) => `${value} IOPS`;
const percentageFormatter = (value: number) =>
  `${Math.round(value * 100) / 100}%`;

export function SystemInfoGraphsPage({ agent }: { agent: Agent }) {
  const { val: temperatureUnit } = useTemperatureUnit();
  const temperatureFormatter =
    temperatureUnit === "celsius"
      ? (value: number) => `${value}°C`
      : (value: number) => `${toFahrenheit(value)}°F`;
  const [period, setPeriod] = useState<MetricsPeriod>("1h");
  return (
    <Stack gap="4">
      <HStack justify="space-between">
        <Stack gap="0.5">
          <Heading as="h2" fontWeight="medium">
            {agent.name ?? "Main Server"}
          </Heading>
          <HStack gap="1">
            <LuGlobe />
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              {agent.addr ?? "localhost"}
            </Text>
          </HStack>
        </Stack>
        <PeriodsSelect period={period} setPeriod={setPeriod} />
      </HStack>
      <Chart
        period={period}
        type="cpu_average"
        label="CPU Usage"
        description="Average CPU usage of the system"
        yAxisFormatter={percentageFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="memory_usage"
        label="Memory Usage"
        description="Memory usage of the system"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="disks_read_speed"
        label="Disk Read Speed"
        description="Disk read speed by device"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="disks_write_speed"
        label="Disk Write Speed"
        description="Disk write speed by device"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="disks_iops"
        label="Disk IOPS"
        description="Disk IOPS by device"
        yAxisFormatter={iopsFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="disk_usage"
        label="Disk Usage"
        description="Disk usage by partition"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="network_speed"
        label="Network Speed"
        description="Overall network speed of the system"
        yAxisFormatter={speedFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="network_transfer"
        label="Network Transfer"
        description="Overall network transfer of the system"
        yAxisFormatter={byteSizeFormatter}
        agent={agent}
      />
      <Chart
        period={period}
        type="sensor_temperature"
        label="Temperature"
        description="Sensor temperature of by device"
        yAxisFormatter={temperatureFormatter}
        agent={agent}
      />
    </Stack>
  );
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ChartOuter({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="6" p="6" bg="var(--on-bg-color)" borderRadius="lg" shadow="xs">
      <Stack gap="1">
        <Heading as="h3" fontWeight="medium">
          {label}
        </Heading>
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

const colorMap: Record<string, string> = {
  download: "hsl(var(--chart-1))",
  upload: "hsl(var(--chart-5))",
  cpu_average: "hsl(var(--chart-2))",
  memory_usage: "hsl(var(--chart-4))",
};

const color = (key: string) => {
  if (!colorMap[key]) {
    colorMap[key] = `hsla(${Math.floor(Math.random() * 360)}, 100%, 70%, 1)`;
  }
  return colorMap[key];
};

const getTimestampTicks = (data: Record<string, any>[]) => {
  const every = Math.floor(data.length / 10);
  return data
    .map((item, index) => {
      if (index % every === 0) return item.timestamp;
      return null;
    })
    .filter((item) => item !== null);
};

const Chart: React.FC<{
  period: MetricsPeriod;
  type: SystemInfoAggregateMode;
  label: string;
  description: string;
  agent: Agent;
  yAxisFormatter: (value: any) => string;
}> = ({ period, type, label, description, yAxisFormatter, agent }) => {
  const [data, setData] = useState<SystemInfoAggregate>({
    data: [],
    total: 0,
  });

  useWebSocketApi<SystemInfoAggregate>({
    endpoint: `/metrics/system_info`,
    query: {
      period,
      aggregate: type,
      agent_addr: agent.addr ?? "",
      interval: "5s",
    },
    onMessage: (data) => setData(data),
  });

  if (!data.data?.length) {
    return (
      <ChartOuter label={label} description={description}>
        <EmptyState title="No enough data for the period" />
      </ChartOuter>
    );
  }

  return (
    <ChartOuter label={label} description={description}>
      <ChartInner data={data.data} yAxisFormatter={yAxisFormatter} />
    </ChartOuter>
  );
};

const ChartInner: React.FC<{
  data: Record<string, any>[];
  yAxisFormatter: (value: any) => string;
}> = ({ data, yAxisFormatter }) => {
  const [keys, setKeys] = useState<string[]>([]);
  useEffectOnce(() => {
    setKeys(Object.keys(data[0]!).filter((key) => key !== "timestamp"));
  });
  const chart = useChart({
    data,
    series: keys.map((key) => ({
      name: key,
      color: color(key),
      stackId: key,
    })),
  });

  return (
    <ChakraChart.Root chart={chart} maxH={`${280 + keys.length * 10}px`}>
      <AreaChart accessibilityLayer data={chart.data}>
        <CartesianGrid
          stroke={chart.color("border")}
          vertical={false}
          strokeDasharray="3 3"
        />
        <RechartsTooltip
          cursor={false}
          animationDuration={100}
          content={(props) => {
            const { active, payload } = props;
            if (!active || !payload?.length) return null;
            return (
              <Stack bg="bg.muted" p="2" borderRadius="lg">
                <Label fontSize="xs">
                  {new Date(
                    (payload[0]!.payload as Record<string, any>).timestamp *
                      1000,
                  ).toLocaleString(undefined, {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Label>
                <Stack gap="1">
                  {payload.reduce((acc, { dataKey }, index) => {
                    if (dataKey === "timestamp") return acc;
                    const item = payload[index];
                    if (!item) return acc;
                    if (item.value === 0) return acc;
                    acc.push(
                      <HStack gap="2" justify="space-between">
                        <HStack gap="2">
                          <Box
                            w="2"
                            h="2"
                            bg={color(dataKey as string)}
                            borderRadius="full"
                          />
                          <Label fontSize="xs">{dataKey}</Label>
                        </HStack>
                        <Label fontSize="xs">
                          {yAxisFormatter(item.value)}
                        </Label>
                      </HStack>,
                    );
                    return acc;
                  }, [] as React.ReactNode[])}
                </Stack>
              </Stack>
            );
          }}
        />
        <XAxis
          dataKey={chart.key("timestamp")}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={formatTimestamp}
          ticks={getTimestampTicks(data)}
          stroke={chart.color("border")}
        />
        <YAxis tickFormatter={yAxisFormatter} axisLine={true} />
        {keys.length > 1 && <Legend content={<ChakraChart.Legend />} />}
        {chart.series.map((item) => (
          <defs key={item.name}>
            <ChakraChart.Gradient
              id={`${item.name}-gradient`}
              stops={[
                { offset: "0%", color: item.color, opacity: 0.5 },
                { offset: "100%", color: item.color, opacity: 0.05 },
              ]}
            />
          </defs>
        ))}
        {chart.series.map((item) => (
          <Area
            key={item.name}
            dataKey={chart.key(item.name)}
            animationEasing="ease"
            animationDuration={500}
            hide={
              chart.highlightedSeries !== null &&
              item.name !== chart.highlightedSeries
            }
            fill={`url(#${item.name}-gradient)`}
            fillOpacity={0.8}
            stroke={chart.color(item.color)}
            strokeWidth={2}
            radius={4}
            type="monotone"
            stackId={item.stackId}
          />
        ))}
      </AreaChart>
    </ChakraChart.Root>
  );
};
