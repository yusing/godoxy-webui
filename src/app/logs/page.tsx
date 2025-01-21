"use client";

import { Prose } from "@/components/ui/prose";
import { StepperInput } from "@/components/ui/stepper-input";
import { Switch } from "@/components/ui/switch";
import Endpoints, { useWS } from "@/types/api/endpoints";
import { useSetting } from "@/types/settings";
import { Card, ClientOnly, Group, HStack, Stack, Text } from "@chakra-ui/react";
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
    <Card.Root w="full" h="full">
      <Card.Body>
        <Stack
          ref={logRef}
          m="4"
          w="50vw"
          h="80vh"
          overflowY="scroll"
          gap="0"
          scrollBehavior="smooth"
          scrollbar={"hidden"}
        >
          {readyState === ReadyState.CONNECTING ? (
            <Prose>Loading...</Prose>
          ) : null}
          {logs.map((l) => (
            <Prose
              fontSize={"md"}
              dangerouslySetInnerHTML={{ __html: convertANSI.toHtml(l) }}
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
      </Card.Body>
    </Card.Root>
  );
}
