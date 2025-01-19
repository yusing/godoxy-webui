"use client";

import { Prose } from "@/components/ui/prose";
import { toaster } from "@/components/ui/toaster";
import Endpoints, { ws } from "@/types/api/endpoints";
import { Card, Stack } from "@chakra-ui/react";
import Convert from "ansi-to-html";
import log from "loglevel";
import React from "react";

const convertANSI = new Convert();

export default function Logs() {
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [logs, setLogs] = React.useState<string[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const socket = ws(Endpoints.LOGS);
    socket.onopen = () => {
      setIsConnecting(false);
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    };
    socket.onmessage = (event) => {
      setLogs((prev) => prev.concat((event.data as string).split("\n")));
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    };
    socket.onerror = (event) => {
      toaster.error(event);
      log.error(event);
    };
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
      </Card.Body>
    </Card.Root>
  );
}
