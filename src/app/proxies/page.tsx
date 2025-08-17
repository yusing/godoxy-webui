"use client";

import {
  Badge,
  Box,
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
import { useWebSocketApi } from "@/hooks/websocket";
import type { Route, RouteProvider } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import type { HealthStatusType } from "@/types/api/health";
import { useRouter } from "next/navigation";
import { memo, useMemo, useState } from "react";
import { MdError } from "react-icons/md";
import { ReadyState } from "react-use-websocket";

function getStatus(route: Route): HealthStatusType {
  const health = route.health;
  if (!health || health.status === "unknown") {
    if (route.container?.running === false) {
      return "stopped";
    }
    return "unknown";
  }
  return health.status as HealthStatusType;
}

function Alias({ route }: { route: Route }) {
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
    getter: (route: Route) =>
      route.container?.container_name != route.alias ? (
        <Stack gap={1}>
          <Alias route={route} />
          {route.container?.container_name ? (
            <Text color="fg.muted">{route.container?.container_name}</Text>
          ) : (
            Object.values(route.health?.extra?.pool ?? {}).map(
              (health, index) => (
                <Text color="fg.muted" key={index}>
                  {health.name}
                </Text>
              ),
            )
          )}
        </Stack>
      ) : (
        <Alias route={route} />
      ),
  },
  {
    label: "Status",
    getter: (route: Route) => (
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
    getter: (route: Route) =>
      route.provider && (
        <Badge variant={"surface"} colorPalette={"bg"} fontSize="sm">
          {route.provider}
        </Badge>
      ),
  },
  {
    label: "Target",
    getter: (route: Route) => (
      <>
        <Text fontSize={"sm"}>{route.purl}</Text>
        {route.lurl && (
          <Text fontSize={"xs"} color="fg.muted">
            Listening on {route.lurl}
          </Text>
        )}
      </>
    ),
  },
  {
    label: "Uptime",
    getter: (route: Route) =>
      route.health?.uptime && (
        <Text fontSize={"sm"} whiteSpace={"nowrap"}>
          {formatDuration(route.health.uptime)}
        </Text>
      ),
  },
  {
    label: "Latency",
    getter: (route: Route) => (
      <Text fontSize={"sm"} whiteSpace={"nowrap"}>
        {route.health?.latencyStr}
      </Text>
    ),
  },
  {
    label: "Exposed Ports",
    getter: (route: Route) => (
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
    getter: (route: Route) => <Actions route={route} />,
  },
] as const;

function RenderTable_({
  provider,
}: Readonly<{
  provider: RouteProvider | null;
}>) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const { readyState, connectionError } = useWebSocketApi<Route[]>({
    endpoint: "/route/list",
    query: provider ? { provider: provider.short_name } : undefined,
    onMessage: setRoutes,
  });

  const sortedRoutes = useMemo(() => {
    return routes.toSorted((a, b) => {
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
  }, [routes]);

  if (connectionError) {
    return (
      <EmptyState
        placeSelf={"center"}
        icon={<MdError />}
        title="Error"
        description={connectionError}
      />
    );
  }

  if (readyState === ReadyState.CONNECTING) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  if (routes.length === 0) {
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
        <For each={sortedRoutes}>
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

const RenderTable = memo(RenderTable_, (prev, next) => {
  return prev.provider?.full_name === next.provider?.full_name;
});

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
        _dark: {
          bg: "bg.muted",
          color: "fg.default",
        },
      }}
    >
      {children}
    </Tabs.Trigger>
  );
}

export default function ProxiesPage() {
  const fragment = useFragment();
  const router = useRouter();
  const [providers, setProviders] = useState<RouteProvider[]>([]);
  const { readyState } = useWebSocketApi<RouteProvider[]>({
    endpoint: "/route/providers",
    onMessage: setProviders,
  });

  switch (readyState) {
    case ReadyState.UNINSTANTIATED:
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
        <For each={providers}>
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
      <Box pos="relative" minH="400px" width="full">
        <Tabs.Content
          value={"#all"}
          position="absolute"
          inset="0"
          _open={{
            animationName: "fade-in, scale-in",
            animationDuration: "300ms",
            animationTimingFunction: "ease-out",
          }}
          _closed={{
            animationName: "fade-out, scale-out",
            animationDuration: "200ms",
            animationTimingFunction: "ease-in",
          }}
        >
          <RenderTable provider={null} />
        </Tabs.Content>
        {providers ? (
          providers.map((provider) => (
            <Tabs.Content
              key={provider.full_name}
              value={provider.full_name}
              position="absolute"
              inset="0"
              _open={{
                animationName: "fade-in, scale-in",
                animationDuration: "300ms",
                animationTimingFunction: "ease-out",
              }}
              _closed={{
                animationName: "fade-out, scale-out",
                animationDuration: "200ms",
                animationTimingFunction: "ease-in",
              }}
            >
              <RenderTable provider={provider} />
            </Tabs.Content>
          ))
        ) : (
          <Tabs.Content
            value="loading"
            position="absolute"
            inset="0"
            _open={{
              animationName: "fade-in, scale-in",
              animationDuration: "300ms",
              animationTimingFunction: "ease-out",
            }}
            _closed={{
              animationName: "fade-out, scale-out",
              animationDuration: "200ms",
              animationTimingFunction: "ease-in",
            }}
          >
            <Center>
              <Spinner />
            </Center>
          </Tabs.Content>
        )}
      </Box>
    </Tabs.Root>
  );
}
