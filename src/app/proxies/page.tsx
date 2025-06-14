"use client";

import {
  Center,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  For,
  Group,
  HStack,
  Spinner,
  Table,
  Tabs,
  Text,
  useCollapsible,
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
import { useMemo } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { useAsync } from "react-use";

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

export const Columns = [
  {
    label: "Status",
    getter: (route: RouteResponse) => (
      <HStack>
        <HealthStatus value={getStatus(route)} />
        <Text fontSize="sm" color="text.subtle">
          {getStatus(route)}
        </Text>
      </HStack>
    ),
  },
  {
    label: "Provider",
    getter: (route: RouteResponse) => route.provider,
  },
  {
    label: "Alias",
    getter: (route: RouteResponse) => route.alias,
  },
  {
    label: "Container",
    getter: (route: RouteResponse) =>
      route.container?.container_name != route.alias
        ? route.container?.container_name
        : "<",
  },
  {
    label: "Proxied",
    getter: (route: RouteResponse) => (!route.excluded ? "Yes" : "No"),
  },
  {
    label: "Listening",
    getter: (route: RouteResponse) => route.lurl,
  },
  {
    label: "Target",
    getter: (route: RouteResponse) => route.purl,
  },
  {
    label: "Uptime",
    getter: (route: RouteResponse) => formatUptime(route.health?.uptime ?? 0),
  },
  {
    label: "Latency",
    getter: (route: RouteResponse) => route.health?.latencyStr,
  },
  {
    label: "Detail",
    getter: (route: RouteResponse) => {
      return joinMultiple([
        route.container?.errors
          ? `Errors: ${route.container?.errors}`
          : undefined,
        route.health?.detail,
      ]);
    },
  },
] as const;

function joinMultiple(values: (string | undefined)[]) {
  const { open, setOpen } = useCollapsible();
  return (
    <For each={values.filter(Boolean) as string[]}>
      {(value, index) => {
        value = value.trim();
        let idxNewline = -1;
        let numLines = 0;
        let numLongestLine = 0;
        for (const line of value.split("\n")) {
          if (idxNewline === -1) {
            idxNewline = line.length;
          }
          if (line.length > numLongestLine) {
            numLongestLine = line.length;
          }
          numLines++;
        }
        numLongestLine = Math.min(50, numLongestLine);
        const triggerText = "Click to " + (open ? "collapse" : "expand");
        if (numLines > 2) {
          return (
            <CollapsibleRoot
              key={index}
              open={open}
              onOpenChange={({ open }) => setOpen(open)}
            >
              <CollapsibleTrigger>
                {/*  prevents UI shift when open/close */}
                <Group w={`${numLongestLine + triggerText.length}ch`}>
                  {open ? <LuChevronDown /> : <LuChevronRight />}
                  <Text key={index} textAlign={"left"}>
                    {triggerText}
                  </Text>
                </Group>
              </CollapsibleTrigger>
              <CollapsibleContent
                w={`${numLongestLine + triggerText.length}ch`}
              >
                <Text key={index}>{value}</Text>
              </CollapsibleContent>
            </CollapsibleRoot>
          );
        }
        return <Text key={index}>{value}</Text>;
      }}
    </For>
  );
}

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
      striped
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
                  <Table.Cell
                    key={`${item.alias}_${col.label}`}
                    textWrap={col.label !== "Detail" ? "nowrap" : "wrap"}
                    whiteSpace={col.label === "Detail" ? "pre-wrap" : "normal"}
                  >
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

const units = [
  ["y", 31556952],
  ["M", 2629746],
  ["w", 604800],
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
