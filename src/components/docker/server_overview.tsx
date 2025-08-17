import { useWebSocketApi } from "@/hooks/websocket";
import type { ServerInfo } from "@/lib/api";
import { providerName } from "@/lib/format";
import { Box, Center, HStack, Span, Spinner, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { FaDocker } from "react-icons/fa6";
import { LuContainer, LuCpu, LuMemoryStick, LuServer } from "react-icons/lu";
import { ReadyState } from "react-use-websocket";
import { EmptyState } from "../ui/empty-state";
import { IconLabel } from "../ui/label";

export function ServerInfo({ server }: { server: ServerInfo }) {
  return (
    <Box
      py="2"
      px="6"
      shadow={"xs"}
      borderRadius={"md"}
      bg="var(--on-bg-color)"
      alignContent={"center"}
      h="140px"
      minW="250px"
    >
      <Stack>
        <IconLabel fontSize={"xl"} icon={<LuServer />}>
          {providerName(server.name)}
        </IconLabel>
        <HStack justifyContent={"space-between"}>
          <IconLabel icon={<LuCpu />}>
            {server.n_cpu} <Span fontWeight={"normal"}>CPUs</Span>
          </IconLabel>
          <IconLabel icon={<LuMemoryStick />}>{server.memory}</IconLabel>
        </HStack>
        <HStack justifyContent={"space-between"}>
          <IconLabel icon={<LuContainer />}>
            {server.containers.total}{" "}
            <Span fontWeight={"normal"}>Containers</Span>
          </IconLabel>
          <IconLabel icon={<FaDocker />}>{server.version}</IconLabel>
        </HStack>
      </Stack>
    </Box>
  );
}

export function ServerOverview() {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const { readyState } = useWebSocketApi<ServerInfo[]>({
    endpoint: "/docker/info",
    onMessage: (data) => setServers(data),
  });

  if (!servers) {
    switch (readyState) {
      case ReadyState.UNINSTANTIATED:
      case ReadyState.CONNECTING:
      case ReadyState.OPEN:
        return (
          <Center w="full" h="full">
            <Spinner />
          </Center>
        );
      default:
        return <EmptyState title="Failed to get server info" />;
    }
  } else if (servers.length === 0) {
    return (
      <Center w="full" h="full">
        <Spinner />
      </Center>
    );
    // NOTE: There are always servers, just wait for first message
    // return <EmptyState icon={<LuServer />} title="No servers found" />;
  }

  return (
    <Stack direction={"row"} h={"full"} wrap={"wrap"} overflow={"auto"} gap="4">
      {servers.map((server) => (
        <ServerInfo key={server.name} server={server} />
      ))}
    </Stack>
  );
}
