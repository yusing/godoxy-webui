"use client";

import { DockerLogs } from "@/components/logs/docker_logs";
import { GodoxyLogs } from "@/components/logs/godoxy_logs";
import "@/styles/logs.css";
import { ClientOnly, Tabs } from "@chakra-ui/react";
import { useState } from "react";

export default function Page() {
  return (
    <ClientOnly>
      <Logs />
    </ClientOnly>
  );
}

function Logs() {
  const [tab, setTab] = useState<string>(
    window.location.hash.slice(1) || "godoxy",
  );

  return (
    <Tabs.Root
      lazyMount
      unmountOnExit
      value={tab}
      onValueChange={({ value }) => {
        setTab(value);
        window.location.hash = `#${value}`;
      }}
      justify={"center"}
      variant={"enclosed"}
      fitted
    >
      <Tabs.List position={"sticky"} top="0" zIndex={"sticky"}>
        <Tabs.Trigger value="godoxy">GoDoxy</Tabs.Trigger>
        <Tabs.Trigger value="docker">Docker</Tabs.Trigger>
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content value="godoxy">
        <GodoxyLogs px="6" />
      </Tabs.Content>
      <Tabs.Content value="docker">
        <DockerLogs />
      </Tabs.Content>
    </Tabs.Root>
  );
}
