"use client";

import { Prose } from "@/components/ui/prose";
import { StepperInput } from "@/components/ui/stepper-input";
import { Switch } from "@/components/ui/switch";
import "@/styles/logs.css";
import Endpoints, { useWS } from "@/types/api/endpoints";
import { useSetting } from "@/types/settings";
import { bodyHeight } from "@/types/styles";
import { ClientOnly, Group, HStack, Stack, Text } from "@chakra-ui/react";
import Convert from "ansi-to-html";
import React from "react";
import { ReadyState } from "react-use-websocket";

const convertANSI = new Convert();

export default function Page() {
  return (
    <ClientOnly>
      <Logs />
    </ClientOnly>
  );
}

function Logs() {
  const [logs, setLogs] = React.useState<string[]>([]);
  const autoScroll = useSetting("logs_auto_scroll", true);
  const maxLines = useSetting("logs_max_lines", 100);
  const logRef = React.useRef<HTMLDivElement>(null);
  const { data, readyState } = useWS<string>(Endpoints.LOGS);

  React.useEffect(() => {
    if (data) {
      setLogs((prev) => prev.concat(data.split("\n")).slice(-maxLines.val));
    }
  }, [data]);

  React.useEffect(() => {
    if (autoScroll.val) {
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    }
  }, [autoScroll.val, data]);

  return (
    <Stack align={"center"} height={bodyHeight}>
      <Stack
        ref={logRef}
        overflow="auto"
        maxW="100%"
        gap="0"
        bg="bg.subtle"
        border={"1px solid"}
        borderColor="border.emphasized"
        borderRadius={"md"}
        my="2"
      >
        {readyState === ReadyState.CONNECTING ? (
          <Prose>Loading...</Prose>
        ) : null}
        {logs.map((l) => (
          <Prose
            fontFamily={"monospace"}
            fontSize={"md"}
            maxW="100%"
            px="10"
            lineHeight="1.5em"
            dangerouslySetInnerHTML={{
              __html: convertANSI.toHtml(
                l.replaceAll(" ", "&nbsp;").replaceAll("\t", "&emsp;"),
              ),
            }}
          />
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
          <Text fontSize={"sm"} fontWeight={"medium"}>
            Max Lines
          </Text>
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
