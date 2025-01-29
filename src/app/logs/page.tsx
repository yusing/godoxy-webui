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
    <Stack
      align={"center"}
      justify={"center"}
      h={bodyHeight}
      w="100%"
      gap="4"
      px="4"
    >
      <Stack
        ref={logRef}
        overflow="auto"
        textWrap="pretty"
        maxH={"100%"}
        gap="0"
        py="2"
        px={6}
      >
        {readyState === ReadyState.CONNECTING ? (
          <Prose>Loading...</Prose>
        ) : null}
        {logs.map((l) => (
          <Prose
            as="pre"
            fontSize={"md"}
            maxW="100%"
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
