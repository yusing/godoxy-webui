import { ReadyState } from "@/hooks/ws";
import { parseLogLine, type LogLine as LogLineType } from "@/lib/logline";
import { bodyHeight, navBarHeight } from "@/styles";
import Endpoints from "@/types/api/endpoints";
import {
  Box,
  Float,
  For,
  HStack,
  Icon,
  IconButton,
  Stack,
  StackProps,
} from "@chakra-ui/react";
import { memo, useEffect, useRef, useState } from "react";
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

interface LogsProps extends StackProps {
  server: string;
  containerInfo: Container;
}

function Logs({ server, containerInfo, ...props }: LogsProps) {
  const [lines, setLines] = useState<LogLineWithId[]>([]);
  const [readyState, setReadyState] = useState<ReadyState>(
    ReadyState.UNINITIALIZED,
  );
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const [chevronDirection, setChevronDirection] = useState<"up" | "down">("up");
  const idRef = useRef(0);

  useEffect(() => {
    const calcChevronShouldUp = () => {
      if (!logsRef.current) {
        return;
      }
      setChevronDirection(
        logsRef.current.scrollTop >= logsRef.current.scrollHeight / 2
          ? "up"
          : "down",
      );
    };
    logsRef.current?.addEventListener("scroll", calcChevronShouldUp);

    return () => {
      logsRef.current?.removeEventListener("scroll", calcChevronShouldUp);
    };
  }, [logsRef.current]);

  useEffect(() => {
    idRef.current = 0;
    const ws = new WebSocket(
      Endpoints.DOCKER_LOGS({ server, container: containerInfo.id }),
    );
    setReadyState(ReadyState.CONNECTING);
    setLines([]);
    ws.onopen = () => {
      setReadyState(ReadyState.OPEN);
    };
    ws.onmessage = (event) => {
      setLines((prev) => {
        const parsed = parseLogLine(event.data);
        const newLine = { ...parsed, id: idRef.current++ };
        const newLines = [...prev, newLine];
        return newLines.slice(-100);
      });
    };
    ws.onclose = () => {
      setReadyState(ReadyState.CLOSED);
    };
    return () => {
      ws.close();
    };
  }, [server, containerInfo.id]);

  return (
    <Stack w="full" h={bodyHeight} {...props}>
      <Float placement="bottom-end" bottom="12" right="12">
        <IconButton
          variant="solid"
          bg="teal"
          color="white"
          aria-label="Scroll to bottom"
          onClick={() => {
            if (chevronDirection === "up") {
              topRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <Icon as={chevronDirection === "up" ? FaChevronUp : FaChevronDown} />
          {/* TODO: fix scroll to bottom */}
        </IconButton>
      </Float>
      <HStack position={"sticky"} top="0" mx={-3}>
        <ServerListDrawerButton />
        <Label>{containerInfo.name.slice(1)}</Label>
        <Tag>{containerInfo.image}</Tag>
        <ContainerStatusIndicator status={containerInfo.state} withText />
      </HStack>
      <Stack gap="1" overflowY="auto" ref={logsRef}>
        <Box ref={topRef} />
        <For
          each={lines}
          fallback={
            <EmptyState
              title={
                readyState === ReadyState.CONNECTING
                  ? "Connecting..."
                  : readyState === ReadyState.CLOSED
                    ? "Connection closed"
                    : "No logs"
              }
            />
          }
        >
          {(line) => <LogEntry key={line.id} line={line} />}
        </For>
        <Box ref={bottomRef} />
      </Stack>
    </Stack>
  );
}

interface LogLineWithId extends LogLineType {
  id: number;
}

const LogEntry = memo(({ line }: { line: LogLineWithId }) => (
  <HStack gap="2" bg={line.id % 2 === 0 ? "bg.subtle" : "inherit"}>
    <Tag colorPalette="teal" minW="fit" fontFamily={"monospace"}>
      {line.time}
    </Tag>
    <LogLine line={line.content} />
  </HStack>
));

export function DockerLogs({ ...props }: StackProps) {
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const { container } = useContainerContext();
  if (!container) {
    return (
      <Stack direction={"row"} {...props}>
        <SearchInputProvider>
          <Stack gap="2">
            <SearchInput position={"sticky"} top={0} ref={searchInputRef} />
            <ServerList
              onItemClick={() => {}}
              pr={4}
              h={`calc(100vh - ${navBarHeight} - ${searchInputRef.current?.clientHeight ?? 0}px)`}
            />
          </Stack>
        </SearchInputProvider>
        <ServerOverview />
      </Stack>
    );
  }
  return (
    <Logs server={container.server} containerInfo={container} {...props} />
  );
}
