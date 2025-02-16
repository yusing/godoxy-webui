"use client";

import { LogLine } from "@/components/config_editor/logline";
import { Label } from "@/components/ui/label";
import { Prose } from "@/components/ui/prose";
import { StepperInput } from "@/components/ui/stepper-input";
import { Switch } from "@/components/ui/switch";
import { useSetting } from "@/hooks/settings";
import useWebsocket, { ReadyState } from "@/hooks/ws";
import "@/styles/logs.css";
import Endpoints from "@/types/api/endpoints";
import { ClientOnly, Group, HStack, Stack } from "@chakra-ui/react";
import Convert from "ansi-to-html";
import { useEffect, useRef, useState } from "react";

const convertANSI = new Convert();

export default function Page() {
  return (
    <ClientOnly>
      <Logs />
    </ClientOnly>
  );
}

function Logs() {
  const [logs, setLogs] = useState<string[]>([]);
  const autoScroll = useSetting("logs_auto_scroll", true);
  const maxLines = useSetting("logs_max_lines", 100);
  const logRef = useRef<HTMLDivElement>(null);
  const { data, readyState } = useWebsocket<string>(Endpoints.LOGS);

  useEffect(() => {
    if (data) {
      setLogs((prev) => prev.concat(data.split("\n")).slice(-maxLines.val));
    }
  }, [data]);

  useEffect(() => {
    if (autoScroll.val) {
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    }
  }, [autoScroll.val, data]);

  return (
    <Stack align={"center"} justify={"center"} gap="4" px="12" h="full">
      <Stack ref={logRef} overflow="auto" gap="0" w="full" h="full">
        {readyState === ReadyState.CONNECTING ? (
          <Prose>Loading...</Prose>
        ) : null}
        {logs.map((l) => (
          <LogLine key={l} line={l} />
        ))}
      </Stack>
      <HStack gap="6">
        <Switch
          key="auto-scroll"
          checked={autoScroll.val}
          onCheckedChange={({ checked }) => autoScroll.set(checked)}
        >
          Auto Scroll
        </Switch>
        <Group attached>
          <Label>Max Lines</Label>
          <StepperInput
            value={maxLines.val.toString()}
            min={10}
            max={5000}
            step={10}
            onValueChange={({ valueAsNumber }) => maxLines.set(valueAsNumber)}
          ></StepperInput>
        </Group>
      </HStack>
    </Stack>
  );
}
