"use client";
import { PeriodsSelect } from "@/components/metrics/periods_select";
import { useTemperatureUnit } from "@/components/metrics/settings";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import useWebsocket from "@/hooks/ws";
import { formatByte } from "@/lib/format";
import { Agent } from "@/types/api/agent";
import Endpoints from "@/types/api/endpoints";
import { MetricsPeriod } from "@/types/api/metrics/metrics";
import type { AggregateType } from "@/types/api/metrics/system_info";
import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuGlobe } from "react-icons/lu";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

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

const randomColor = (key: string) => {
  if (!colorMap[key]) {
    colorMap[key] = `hsla(${Math.floor(Math.random() * 360)}, 100%, 70%, 1)`;
  }
  return colorMap[key];
};

const timestampTicks = (data: Record<string, any>[]) => {
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

  const chartConfig = Object.keys(data.data[0]!).reduce((acc, key) => {
    if (key === "timestamp") return acc;
    acc[key] = {
      label: key,
      color: randomColor(key),
    };
    return acc;
  }, {} as ChartConfig) satisfies ChartConfig;

  return (
    <ChartOuter label={label} description={description}>
      <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
        <AreaChart accessibilityLayer data={data.data}>
          <ChartTooltip
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
                    {Object.entries(chartConfig).reduce(
                      (acc, [key, config], index) => {
                        if (key === "timestamp") return acc;
                        const item = payload[index];
                        if (!item) return acc;
                        if (item.value === 0) return acc;
                        acc.push(
                          <HStack gap="2" justify="space-between">
                            <HStack gap="2">
                              <Box
                                w="2"
                                h="2"
                                bg={randomColor(key)}
                                borderRadius="full"
                              />
                              <Text fontSize="sm" fontWeight="medium">
                                {config.label}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium">
                              {yAxisFormatter(item.value)}
                            </Text>
                          </HStack>,
                        );
                        return acc;
                      },
                      [] as React.ReactNode[],
                    )}
                  </Stack>
                </Stack>
              );
            }}
          />
          {Object.entries(chartConfig).reduce((acc, [key, config]) => {
            if (key === "timestamp") return acc;
            acc.push(
              <Area
                key={key}
                dataKey={key}
                fill={config.color}
                radius={4}
                type="monotone"
              />,
            );
            return acc;
          }, [] as React.ReactNode[])}
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={formatTimestamp}
            ticks={timestampTicks(data.data)}
          />
          <YAxis tickFormatter={yAxisFormatter} axisLine={true} />
        </AreaChart>
      </ChartContainer>
    </ChartOuter>
  );
};
