import { ReadyState } from "@/hooks/ws";
import { parseLogLine, type LogLine as LogLineType } from "@/lib/logline";
import { bodyHeight } from "@/styles";
import Endpoints from "@/types/api/endpoints";
import {
  Box,
  Float,
  For,
  HStack,
  Icon,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { LogLine } from "../config_editor/logline";
import { EmptyState } from "../ui/empty-state";
import { Label } from "../ui/label";
import { Tag } from "../ui/tag";
import { Container, useContainerContext } from "./container_context";
import { ContainerStatusIndicator } from "./container_status_indicator";
import {
  SearchInput,
  SearchInputProvider,
  ServerList,
  ServerListDrawerButton,
} from "./server_list_drawer";
import { ServerOverview } from "./server_overview";

const Logs: FC<{
  server: string;
  container: Container;
}> = ({ server, container }) => {
  const [lines, setLines] = useState<LogLineType[]>([]);
  const [readyState, setReadyState] = useState<ReadyState>(
    ReadyState.UNINITIALIZED,
  );
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  useEffect(() => {
    const ws = new WebSocket(
      Endpoints.DOCKER_LOGS({ server, container: container.id }),
    );
    setReadyState(ReadyState.CONNECTING);
    ws.onopen = () => {
      setReadyState(ReadyState.OPEN);
      setLines([]);
    };
    ws.onmessage = (event) => {
      setLines((prev) => prev.concat(parseLogLine(event.data)).slice(-100));
    };
    ws.onclose = () => {
      setReadyState(ReadyState.CLOSED);
      setLines([]);
    };
    return () => {
      ws.close();
    };
  }, [server, container]);
  return (
    <Stack w="full" h={bodyHeight}>
      <Float placement="bottom-end" bottom="12" right="12">
        <IconButton
          variant="solid"
          bg="teal"
          color="white"
          aria-label="Scroll to bottom"
          onClick={() => {
            if (isScrolledToBottom) {
              topRef.current?.scrollIntoView({ behavior: "smooth" });
              setIsScrolledToBottom(false);
            } else {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setIsScrolledToBottom(true);
            }
          }}
        >
          <Icon as={isScrolledToBottom ? FaChevronUp : FaChevronDown} />
          {/* TODO: fix scroll to bottom */}
        </IconButton>
      </Float>
      <HStack position={"sticky"} top="0">
        <ServerListDrawerButton />
        <Label>{container.name.slice(1)}</Label>
        <Tag>{container.image}</Tag>
        <ContainerStatusIndicator status={container.state} withText />
      </HStack>
      <Stack gap="1" overflowY="auto">
        <Box ref={topRef} />
        <For
          each={lines}
          fallback={
            <EmptyState
              title={
                readyState === ReadyState.CONNECTING
                  ? "Connecting..."
                  : "Connection closed"
              }
            />
          }
        >
          {(line, index) => (
            <HStack
              key={index}
              gap="2"
              bg={index % 2 === 0 ? "bg.subtle" : "inherit"}
            >
              <Tag colorPalette="teal" minW="fit">
                {line.time}
              </Tag>
              <LogLine line={line.content} />
            </HStack>
          )}
        </For>
        <Box ref={bottomRef} />
      </Stack>
    </Stack>
  );
};

export function DockerLogs() {
  const { container } = useContainerContext();
  if (!container) {
    return (
      <Stack direction={"row"}>
        <SearchInputProvider>
          <Stack gap="4">
            <SearchInput position={"fixed"} top="4" />
            <ServerList />
          </Stack>
        </SearchInputProvider>
        <ServerOverview />
      </Stack>
    );
  }
  return <Logs server={container.server} container={container} />;
}
