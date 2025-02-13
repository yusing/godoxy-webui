"use client";
import SystemInfo from "@/components/metrics/system_info";
import { Uptime } from "@/components/metrics/uptime";
import { InputGroup } from "@/components/ui/input-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MetricsPeriod, MetricsPeriods } from "@/types/api/endpoints";
import { HStack, Input, Spacer, Stack, Tabs } from "@chakra-ui/react";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { LuCpu, LuHeartPulse } from "react-icons/lu";

export default function MetricsPage() {
  const [filter, setFilter] = React.useState("");
  const [period, setPeriod] = React.useState<MetricsPeriod>("1h");
  const [tab, setTab] = React.useState("uptime");

  return (
    <Stack mx="16" my="8">
      <Tabs.Root
        value={tab}
        onValueChange={({ value }) => setTab(value)}
        variant={"enclosed"}
        lazyMount
        unmountOnExit
      >
        <HStack justify={"space-between"}>
          <Tabs.List>
            <Tabs.Trigger value="uptime">
              <LuHeartPulse />
              Uptime
            </Tabs.Trigger>
            <Tabs.Trigger value="system_info">
              <LuCpu />
              System Info
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          {tab === "uptime" && (
            <InputGroup startElement={<FaSearch />}>
              <Input
                placeholder="Filter..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </InputGroup>
          )}
          <Spacer />
          <SegmentedControl
            value={period}
            onValueChange={({ value }) => setPeriod(value)}
            items={MetricsPeriods}
            fontWeight={"medium"}
          />
        </HStack>
        <Tabs.Content value="uptime">
          <Uptime period={period} filter={filter} />
        </Tabs.Content>
        <Tabs.Content value="system_info">
          <SystemInfo />
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
