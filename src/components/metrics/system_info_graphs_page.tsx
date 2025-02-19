"use client";
import { PeriodsSelect } from "@/components/metrics/periods_select";
import { useTemperatureUnit } from "@/components/metrics/settings";
import { EmptyState } from "@/components/ui/empty-state";
import useWebsocket from "@/hooks/ws";
import { formatByte } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/api/agent";
import Endpoints from "@/types/api/endpoints";
import { MetricsPeriod } from "@/types/api/metrics/metrics";
import type { AggregateType } from "@/types/api/metrics/system_info";
import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuGlobe } from "react-icons/lu";
import { useEffectOnce } from "react-use";
import {
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Label } from "../ui/label";

export const SystemInfoGraphsPage: React.FC<{
  agent: Agent;
}> = ({ agent }) => {
  const { val: temperatureUnit } = useTemperatureUnit();
  const temperatureFormatter =
    temperatureUnit === "celsius"
      ? (value: number) => `${value}°C`
      : (value: number) => `${(value * 9) / 5 + 32}°F`;
  const byteSizeFormatter = (value: number) => formatByte(value, 0);
  const speedFormatter = (value: number) => `${byteSizeFormatter(value)}/s`;
  const iopsFormatter = (value: number) => `${value} IOPS`;
  const percentageFormatter = (value: number) =>
    `${Math.round(value * 100) / 100}%`;
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
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChartOuter: React.FC<{
  label: string;
  description: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
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
};

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
  type: AggregateType;
  label: string;
  description: string;
  agent: Agent;
  yAxisFormatter: (value: any) => string;
}> = ({ period, type, label, description, yAxisFormatter, agent }) => {
  const { data } = useWebsocket<{ data: Record<string, any>[] }>(
    Endpoints.metricsSystemInfo({
      period,
      aggregate: type,
      agent_addr: agent?.addr,
      interval: "5s",
    }),
    { json: true },
  );

  if (!data || !data.data?.length) {
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

  return (
    <ResponsiveContainer
      className={cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        "max-h-[200px] w-full",
      )}
    >
      <AreaChart accessibilityLayer data={data}>
        <RechartsTooltip
          content={(props) => {
            const { active, payload } = props;
            if (!active || !payload?.length) return null;
            return (
              <Stack bg="bg.muted" p="2" borderRadius="lg">
                <Text fontSize="sm" fontWeight="medium">
                  {new Date(
                    (payload[0]!.payload as Record<string, any>).timestamp *
                      1000,
                  ).toLocaleString(undefined, {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Stack gap="0.5">
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
                          <Label>{dataKey}</Label>
                        </HStack>
                        <Label>{yAxisFormatter(item.value)}</Label>
                      </HStack>,
                    );
                    return acc;
                  }, [] as React.ReactNode[])}
                </Stack>
              </Stack>
            );
          }}
        />
        {keys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            fill={color(key)}
            radius={4}
            type="monotone"
          />
        ))}
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={formatTimestamp}
          ticks={getTimestampTicks(data)}
        />
        <YAxis tickFormatter={yAxisFormatter} axisLine={true} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
