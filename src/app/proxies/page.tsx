"use client";

import {
  Center,
  For,
  HStack,
  Spinner,
  Table,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { EmptyState } from "@/components/ui/empty-state";
import useWebsocket, { ReadyState } from "@/hooks/ws";
import { MdError } from "react-icons/md";

import { HealthStatus } from "@/components/health_status";
import { useFragment } from "@/hooks/fragment";
import Endpoints from "@/types/api/endpoints";
import { type RouteResponse } from "@/types/api/route/route";
import { type RouteProviderResponse } from "@/types/api/route_provider";
import { getRoutes } from "@/types/api/routes";
import { useRouter } from "next/navigation";
import { useAsync } from "react-use";

export const Columns = [
  {
    label: "Alias",
    getter: (route: RouteResponse) => route.alias,
    w: 10,
  },
  {
    label: "Load Balancer",
    getter: (route: RouteResponse) => route.health?.extra?.config?.link,
    w: 10,
  },
  {
    label: "Listening",
    getter: (route: RouteResponse) => route.lurl,
    w: 12.5,
  },
  {
    label: "Target",
    getter: (route: RouteResponse) => route.purl,
    w: 12.5,
  },
  {
    label: "Status",
    getter: (route: RouteResponse) => (
      <HStack>
        <HealthStatus value={route.health?.status ?? "unknown"} />
        <Text fontSize="sm" color="text.subtle">
          {route.health?.status ?? "unknown"}
        </Text>
      </HStack>
    ),
    w: 10,
  },
  {
    label: "Detail",
    getter: (route: RouteResponse) => route.health?.detail,
    w: 20,
  },
  {
    label: "Uptime",
    getter: (route: RouteResponse) => route.health?.uptimeStr,
    w: 15,
  },
  {
    label: "Latency",
    getter: (route: RouteResponse) => route.health?.latencyStr,
    w: 10,
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
      // sortDescriptor={list.sortDescriptor}
      // onSortChange={list.sort}
    >
      <Table.Header>
        <Table.Row bg="bg.emphasized">
          <For each={Columns}>
            {(col) => (
              <Table.ColumnHeader key={`${col.label}`} w={`${col.w}%`}>
                {col.label}
              </Table.ColumnHeader>
            )}
          </For>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <For
          each={(routes.value ?? []).toSorted((a, b) =>
            a.alias.localeCompare(b.alias),
          )}
        >
          {(item) => (
            <Table.Row key={`${item.alias}`}>
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

export default function ProxiesPage() {
  if (Columns.reduce((acc, col) => acc + col.w, 0) !== 100) {
    throw new Error("Columns width sum is not 100");
  }

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
      px="4"
      lazyMount
      unmountOnExit
    >
      <Tabs.List gap={6} rounded="l3" p="1">
        <Tabs.Trigger key={"#all"} value={"#all"}>
          All
        </Tabs.Trigger>
        <For each={providers.data ?? []}>
          {(provider) => (
            <Tabs.Trigger key={provider.full_name} value={provider.full_name}>
              {provider.short_name}
            </Tabs.Trigger>
          )}
        </For>
        <Tabs.Indicator rounded="l2" />
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
