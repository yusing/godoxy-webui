"use client";

import { Prose } from "@/components/ui/prose";
import { Switch } from "@/components/ui/switch";
import Endpoints, { ws } from "@/types/api/endpoints";
import { Card, Stack } from "@chakra-ui/react";
import Convert from "ansi-to-html";
import log from "loglevel";
import React from "react";

const convertANSI = new Convert();

export default function Logs() {
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const socket = ws(Endpoints.LOGS);
    socket.onopen = () => {
      setIsConnecting(false);
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    };
    socket.onmessage = (event) => {
      setLogs((prev) =>
        prev.concat((event.data as string).split("\n")).slice(-100),
      );
      if (autoScroll) {
        logRef.current?.scrollTo(0, logRef.current.scrollHeight);
      }
    };
    socket.onerror = log.error;
    return () => {
      socket.close();
    };
  }, []);

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
          {isConnecting ? <Prose>Loading...</Prose> : null}
          {logs.map((l) => (
            <Prose
              fontSize={"md"}
              dangerouslySetInnerHTML={{ __html: convertANSI.toHtml(l) }}
            />
          ))}
        </Stack>
        <Switch
          key="auto-scroll"
          checked={autoScroll}
          onCheckedChange={({ checked }) => setAutoScroll(checked)}
        >
          Auto-scroll
        </Switch>
      </Card.Body>
    </Card.Root>
  );
}
