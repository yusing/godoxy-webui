import useWebsocket from "@/hooks/ws";
import Endpoints from "@/types/api/endpoints";
import {
  Collapsible,
  Flex,
  For,
  HStack,
  Stack,
  StackProps,
  Status,
} from "@chakra-ui/react";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LogLine } from "../config_editor/logline";
import { Label } from "../ui/label";
import { SkeletonText } from "../ui/skeleton";
import { Tag } from "../ui/tag";

type LogLine = {
  time: string;
  content: string;
};

type Container = {
  server: string;
  name: string;
  id: string;
  state: "running" | "paused" | "restarting" | "exited" | "dead";
  image: string;
};

// 2025-02-19T17:06:57.726414698Z [xxx] 2025/02/19 17:06:57 xxxx
const parseLogLine = (line: string): LogLine => {
  const [timestamp, ...content] = line.split(" ");
  const date = new Date(timestamp!);
  return {
    time: date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    content: content
      .join(" ")
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?Z/, "")
      .replace(
        /(?:\u001b\[\d{2}m)?(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})[,\s]*/,
        "",
      )
      .replace(
        /(?:\d{1,2}:\d{1,2}(?::\d{1,2})?\s*(?:[ap]m)?(?:\u001b\[32m)?)(?:\.\d*)?/i,
        "",
      )
      .split(" ")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .join(" "),
  };
};

const Logs: FC<{
  server: string;
  container: Container;
}> = ({ server, container }) => {
  const [lines, setLines] = useState<LogLine[]>([]);
  useEffect(() => {
    const ws = new WebSocket(
      Endpoints.DOCKER_LOGS({ server, container: container.id }),
    );
    ws.onmessage = (event) => {
      setLines((prev) => prev.concat(parseLogLine(event.data)).slice(-100));
    };
    ws.onerror = (event) => {
      console.error(event);
    };
    ws.onclose = () => {
      console.log("closed");
    };
    return () => {
      ws.close();
    };
  }, [server, container]);
  return (
    <Stack w="full">
      <HStack position={"sticky"} top="0" bg="bg.emphasized">
        <Label>{container.name.slice(1)}</Label>
        <Tag>{container.image}</Tag>
        <ContainerStatusIndicator status={container.state} withText />
      </HStack>
      <Stack gap="0" overflow="auto" h="85vh">
        {lines.map((line, index) => (
          <HStack
            key={index}
            gap="2"
            bg={index % 2 === 0 ? "bg.subtle" : "inherit"}
          >
            <Tag size="sm" colorPalette="teal">
              <Label p="1">{line.time}</Label>
            </Tag>
            <LogLine line={line.content} />
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
};

type ContainerContextType = {
  containers: Container[];
  container: Container | null;
  setContainer: (container: Container) => void;
};

const ContainerContext = createContext<ContainerContextType>({
  containers: [],
  container: null,
  setContainer: () => {},
});

const ContainerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [container, setContainer] = useState<Container | null>(null);
  const { data: containers } = useWebsocket<Container[]>(
    Endpoints.DOCKER_CONTAINERS,
    {
      json: true,
    },
  );
  return (
    <ContainerContext.Provider
      value={useMemo(
        () => ({
          containers: containers ?? [],
          container,
          setContainer,
        }),
        [containers, container, setContainer],
      )}
    >
      {children}
    </ContainerContext.Provider>
  );
};

const DummyContainerList: FC = () => {
  return Array.from({ length: 20 }).map((_, index) => (
    <SkeletonText noOfLines={1} key={index} />
  ));
};

const StatusMapping = {
  running: "green",
  paused: "yellow", // idlewatcher
  exited: "yellow", // idlewatcher
  restarting: "orange",
  dead: "red",
};

const ContainerStatusIndicator: FC<{
  status: Container["state"];
  withText?: boolean;
}> = ({ status, withText = false }) => {
  return (
    <Status.Root>
      <Status.Indicator colorPalette={StatusMapping[status]} />
      {withText ? <Label>{status}</Label> : null}
    </Status.Root>
  );
};

const ContainerItem: FC<{ container: Container } & StackProps> = ({
  container,
  ...props
}) => {
  const { setContainer } = useContext(ContainerContext);
  return (
    <HStack
      {...props}
      onClick={() => setContainer(container)}
      _hover={{
        bg: "var(--hover-bg)",
      }}
      gap="2"
    >
      <ContainerStatusIndicator status={container.state} />
      <Label>{container.name.slice(1)}</Label>
    </HStack>
  );
};

const ContainerList: FC<{ server: string; containers: Container[] }> = ({
  server,
  containers,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Collapsible.Root
      open={!collapsed}
      onOpenChange={({ open }) => setCollapsed(!open)}
      lazyMount
      unmountOnExit
    >
      <Collapsible.Trigger>
        <Label>
          {server} ({containers.length})
        </Label>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <For each={containers} fallback={<DummyContainerList />}>
          {(container) => (
            <ContainerItem
              key={container.id}
              container={container}
              pl={4}
              py="2"
            />
          )}
        </For>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const ServerList: FC = () => {
  const { containers } = useContext(ContainerContext);
  const containerByServer = useMemo(
    () =>
      containers.reduce(
        (acc, container) => {
          acc[container.server] ??= [];
          acc[container.server]!.push(container);
          return acc;
        },
        {} as Record<string, Container[]>,
      ),
    [containers],
  );
  return (
    <Stack
      h="85vh"
      w="20%"
      overflow="auto"
      maxW="250px"
      borderRight="1px solid"
      borderColor={"border.emphasized"}
    >
      <For each={Object.entries(containerByServer)}>
        {([server, containers]) => (
          <ContainerList key={server} server={server} containers={containers} />
        )}
      </For>
    </Stack>
  );
};

const DockerLogsInner: FC = () => {
  const { container } = useContext(ContainerContext);
  return (
    <Flex>
      <ServerList />
      {container ? (
        <Logs server={container.server} container={container} />
      ) : null}
    </Flex>
  );
};

export const DockerLogs = () => {
  return (
    <ContainerProvider>
      <DockerLogsInner />
    </ContainerProvider>
  );
};
