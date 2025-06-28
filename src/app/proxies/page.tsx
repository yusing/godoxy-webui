"use client";

import {
  Badge,
  Center,
  Flex,
  For,
  HStack,
  Spinner,
  Stack,
  Table,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { HealthStatusBadge } from "@/components/health_status";
import { Actions } from "@/components/proxies/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { useFragment } from "@/hooks/fragment";
import useWebsocket, { ReadyState } from "@/hooks/ws";
import "@/styles/yaml_editor.css";
import Endpoints from "@/types/api/endpoints";
import { type RouteResponse } from "@/types/api/route/route";
import { type RouteProviderResponse } from "@/types/api/route_provider";
import { getRoutes } from "@/types/api/routes";
import { Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { MdError } from "react-icons/md";
import { useAsync } from "react-use";

const GeistMono = Geist_Mono({
  subsets: ["latin"],
});

function getStatus(route: RouteResponse) {
  const health = route.health;
  if (!health || health.status === "unknown") {
    if (route.container?.running === false) {
      return "stopped";
    }
    return "unknown";
  }
  return health.status;
}

function Alias({ route }: { route: RouteResponse }) {
  return (
    <HStack>
      <Text>{route.alias}</Text>
      <Badge
        variant={"subtle"}
        colorPalette={route.excluded ? "gray" : "green"}
      >
        {route.excluded ? "Excluded" : "Proxied"}
      </Badge>
      {route.health?.extra && (
        <Badge variant={"subtle"} colorPalette={"gray"} fontSize={"xs"}>
          Load-Balancer
        </Badge>
      )}
    </HStack>
  );
}

export const Columns = [
  {
    label: "Service",
    getter: (route: RouteResponse) =>
      route.container?.container_name != route.alias ? (
        <Stack gap={1}>
          <Alias route={route} />
          {route.container?.container_name ? (
            <Text color="fg.muted">{route.container?.container_name}</Text>
          ) : (
            Object.values(route.health?.extra?.pool ?? {}).map((health) => (
              <Text color="fg.muted">{health.name}</Text>
            ))
          )}
        </Stack>
      ) : (
        <Alias route={route} />
      ),
  },
  {
    label: "Status",
    getter: (route: RouteResponse) => (
      <Stack>
        <HealthStatusBadge status={getStatus(route)} />
        {route.health?.detail && (
          <Text
            fontSize={"xs"}
            color="fg.muted"
            maxW={"20ch"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
          >
            {route.health.detail}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    label: "Provider",
    getter: (route: RouteResponse) =>
      route.provider && (
        <Badge variant={"surface"} colorPalette={"bg"} fontSize="sm">
          {route.provider}
        </Badge>
      ),
  },
  {
    label: "Target",
    getter: (route: RouteResponse) => (
      <>
        <Text className={GeistMono.className} fontSize={"sm"}>
          {route.purl}
        </Text>
        {route.lurl && (
          <Text
            className={GeistMono.className}
            fontSize={"xs"}
            color="fg.muted"
          >
            Listening on {route.lurl}
          </Text>
        )}
      </>
    ),
  },
  {
    label: "Uptime",
    getter: (route: RouteResponse) =>
      route.health?.uptime && (
        <Text className={GeistMono.className} fontSize={"sm"}>
          {formatUptime(route.health.uptime)}
        </Text>
      ),
  },
  {
    label: "Latency",
    getter: (route: RouteResponse) => (
      <Text className={GeistMono.className} fontSize={"sm"}>
        {route.health?.latencyStr}
      </Text>
    ),
  },
  {
    label: "Exposed Ports",
    getter: (route: RouteResponse) => (
      <Flex flexWrap={"wrap"} gap={1}>
        {Object.entries(route.container?.public_ports ?? {}).map(
          ([_, portInfo]) => (
            <Badge
              key={portInfo.PublicPort}
              variant={"outline"}
              fontSize={"xs"}
            >
              {portInfo.PublicPort}
            </Badge>
          ),
        )}
      </Flex>
    ),
  },
  {
    label: "Actions",
    getter: (route: RouteResponse) => <Actions route={route} />,
  },
] as const;

function RenderTable({
  provider,
}: Readonly<{
  provider: RouteProviderResponse | null;
}>) {
  const routes = useAsync(
    async () => getRoutes(provider?.short_name ?? ""),
    [provider],
  );

  const sortedRoutes = useMemo(() => {
    return routes.value?.toSorted((a, b) => {
      if (a.excluded && !b.excluded) {
        return 1;
      }
      if (!a.excluded && b.excluded) {
        return -1;
      }
      const providerA = a.provider ?? "";
      const providerB = b.provider ?? "";

      const providerComparison = providerA.localeCompare(providerB);
      if (providerComparison !== 0) {
        return providerComparison;
      }

      const networkA = a.container?.network ?? "";
      const networkB = b.container?.network ?? "";
      const networkComparison = networkA.localeCompare(networkB);
      if (networkComparison !== 0) {
        return networkComparison;
      }

      return a.alias.localeCompare(b.alias);
    });
  }, [routes.value]);

  if (routes.error) {
    return (
      <EmptyState
        placeSelf={"center"}
        icon={<MdError />}
        title="Error"
        description={routes.error.message}
      />
    );
  }

  if (routes.value?.length === 0) {
    return (
      <EmptyState
        placeSelf={"center"}
        title="No routes"
        description="start some docker containers or add some routes in include files."
      />
    );
  }

  return (
    <Table.Root
      interactive
      stickyHeader
      native
      // sortDescriptor={list.sortDescriptor}
      // onSortChange={list.sort}
    >
      <Table.Header>
        <Table.Row bg="bg.emphasized">
          <For each={Columns}>
            {(col) => (
              <Table.ColumnHeader key={`${col.label}`}>
                {col.label}
              </Table.ColumnHeader>
            )}
          </For>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <For each={sortedRoutes ?? []}>
          {(item) => (
            <Table.Row key={`${item.provider}_${item.alias}`}>
              <For each={Columns}>
                {(col) => (
                  <Table.Cell key={`${item.alias}_${col.label}`}>
                    {col.getter(item)}
                  </Table.Cell>
                )}
              </For>
            </Table.Row>
          )}
        </For>
      </Table.Body>
    </Table.Root>
  );
}

function StyledTabTrigger({ children, ...props }: Tabs.TriggerProps) {
  return (
    <Tabs.Trigger
      {...props}
      px={4}
      py={2}
      rounded="lg"
      fontWeight="medium"
      fontSize="sm"
      transition="all 0.2s"
      _hover={{
        bg: "bg.emphasized",
        color: "fg.emphasized",
      }}
      _selected={{
        bg: "white",
        color: "fg.default",
        shadow: "xs",
        fontWeight: "semibold",
      }}
    >
      {children}
    </Tabs.Trigger>
  );
}

export default function ProxiesPage() {
  const fragment = useFragment();
  const router = useRouter();
  const providers = useWebsocket<RouteProviderResponse[]>(
    Endpoints.LIST_ROUTE_PROVIDERS,
    {
      json: true,
      sort: (a, b) => a.full_name.localeCompare(b.full_name),
    },
  );

  switch (providers.readyState) {
    case ReadyState.UNINITIALIZED:
    case ReadyState.CONNECTING:
      return (
        <Center>
          <Spinner />
        </Center>
      );
    case ReadyState.CLOSED:
      return <EmptyState icon={<MdError />} title="Error" />;
  }

  return (
    <Tabs.Root
      defaultValue={"#all"}
      value={fragment}
      onValueChange={(e) => router.push(`#${e.value}`)}
      lazyMount
      unmountOnExit
    >
      <Tabs.List
        gap={2}
        rounded="xl"
        p="1"
        bg="bg.muted"
        border="1px solid"
        borderColor="border.muted"
        shadow="sm"
      >
        <StyledTabTrigger key={"#all"} value={"#all"}>
          All
        </StyledTabTrigger>
        <For each={providers.data ?? []}>
          {(provider) => (
            <StyledTabTrigger
              key={provider.full_name}
              value={provider.full_name}
            >
              {provider.short_name}
            </StyledTabTrigger>
          )}
        </For>
      </Tabs.List>
      <Tabs.Content value={"#all"}>
        <RenderTable provider={null} />
      </Tabs.Content>
      {providers.data ? (
        providers.data.map((provider) => (
          <Tabs.Content key={provider.full_name} value={provider.full_name}>
            <RenderTable provider={provider} />
          </Tabs.Content>
        ))
      ) : (
        <Tabs.Content value="loading">
          <Center>
            <Spinner />
          </Center>
        </Tabs.Content>
      )}
    </Tabs.Root>
  );
}

const units = [
  ["d", 86400],
  ["h", 3600],
  ["m", 60],
  ["s", 1],
] as const;

function formatUptime(uptime: number) {
  if (uptime === 0) {
    return undefined;
  }

  let result = "";
  for (const [unit, value] of units) {
    if (uptime >= value) {
      result += `${Math.floor(uptime / value)}${unit}`;
      uptime %= value;
    }
  }
  return result;
}
