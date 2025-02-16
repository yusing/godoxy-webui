"use client";
import { AddAgentDialogButton } from "@/components/metrics/add_agent_button";
import { PeriodsSelect } from "@/components/metrics/periods_select";
import { MetricsSettings } from "@/components/metrics/settings";
import SystemInfo from "@/components/metrics/system_info";
import { Uptime } from "@/components/metrics/uptime";

import { InputGroup } from "@/components/ui/input-group";
import { Toaster } from "@/components/ui/toaster";
import { setUrlFragment } from "@/hooks/url_fragment";
import { MetricsPeriod } from "@/types/api/metrics/metrics";
import {
  ClientOnly,
  HStack,
  Input,
  Spacer,
  Stack,
  Tabs,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { LuCpu, LuHeartPulse } from "react-icons/lu";
export default function MetricsPage() {
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState(window.location.hash.slice(1) || "uptime");
  const [period, setPeriod] = useState<MetricsPeriod>("1h");
  return (
    <Stack mx="16" my="8">
      <Tabs.Root
        value={tab}
        onValueChange={({ value }) => {
          setTab(value);
          setUrlFragment(value);
        }}
        variant={"enclosed"}
        lazyMount
        unmountOnExit
      >
        <HStack justify={"space-between"} wrap={"wrap"}>
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
          <Toaster />
          <AddAgentDialogButton />
          <ClientOnly>
            <MetricsSettings />
          </ClientOnly>
          <Spacer />
          <PeriodsSelect period={period} setPeriod={setPeriod} />
        </HStack>
        <Tabs.Content value="uptime">
          <ClientOnly>
            <Uptime filter={filter} period={period} />
          </ClientOnly>
        </Tabs.Content>
        <Tabs.Content value="system_info">
          <ClientOnly>
            <SystemInfo />
          </ClientOnly>
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
