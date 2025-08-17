import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";

import { useWebSocketApi } from "@/hooks/websocket";
import type {
  HomepageItem,
  MetricsPeriod,
  RouteStatus,
  RouteUptimeAggregate,
  UptimeAggregate,
} from "@/lib/api";
import { api } from "@/lib/api-client";
import { formatPercent, formatTimestamp } from "@/lib/format";
import { healthStatusColors } from "@/types/api/health";
import {
  Box,
  Card,
  type CardRootProps,
  Center,
  Group,
  HStack,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import React, { type FC, memo, useMemo, useState } from "react";
import { useAsync, useWindowSize } from "react-use";
import { FavIcon } from "../dashboard/favicon";
import { HealthStatus, HealthStatusTag } from "../health_status";
import { EmptyState } from "../ui/empty-state";
import { Label } from "../ui/label";
import { Tooltip } from "../ui/tooltip";
import {
  useColsCount,
  useColsGap,
  useLayoutMode,
  useRowGap,
  useRowsCount,
  useSquareCardSize,
} from "./settings";

export const Uptime: FC<{
  filter?: string;
  period: MetricsPeriod;
}> = ({ filter, period }) => {
  const [page, setPage] = useState(1);
  const rowsCount = useRowsCount();
  const colsCount = useColsCount();
  const rowGap = useRowGap();
  const colsGap = useColsGap();
  const countPerPage = rowsCount.val * colsCount.val;
  const [uptime, setUptime] = useState<UptimeAggregate>();
  useWebSocketApi<UptimeAggregate>({
    endpoint: `/metrics/uptime`,
    query: {
      period,
      keyword: filter ?? "",
      limit: countPerPage,
      offset: (page - 1) * countPerPage,
    },
    onMessage: setUptime,
  });

  if (!uptime) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }
  if (uptime.total === 0) {
    if (filter) {
      return <EmptyState title="No matching metrics found" />;
    }
    return <EmptyState title="Not enough data gathered for the period" />;
  }

  return (
    <PaginationRoot
      count={uptime.total}
      pageSize={countPerPage}
      page={page}
      onPageChange={({ page }) => setPage(page)}
      siblingCount={10}
    >
      <Stack gap="4">
        <SimpleGrid
          columns={colsCount.val}
          rowGap={rowGap.val}
          columnGap={colsGap.val}
        >
          {uptime.data.map((metrics) => (
            <Layout key={metrics.alias} metrics={metrics} />
          ))}
        </SimpleGrid>
        {uptime.data.length < uptime.total && (
          <HStack justify={"center"} w="full">
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </HStack>
        )}
      </Stack>
    </PaginationRoot>
  );
};

function Layout({ metrics }: { metrics: RouteUptimeAggregate }) {
  const layoutMode = useLayoutMode();
  const AppCard = React.useMemo(() => {
    return layoutMode.val === "square_card"
      ? RouteUptimeSquare
      : layoutMode.val === "rect_card"
        ? RouteUptimeMinimal
        : RouteUptime;
  }, [layoutMode.val]);
  const routeInfo = useAsync(
    () => api.route.route(metrics.alias),
    [metrics.alias],
  );

  return (
    <Link href={routeInfo.value?.data.homepage.url} target="_blank" unstyled>
      <AppCard
        metrics={metrics}
        _hover={{
          bg: "var(--hover-bg)",
        }}
      />
    </Link>
  );
}

function title(metrics: RouteUptimeAggregate) {
  if (!metrics.display_name) {
    return metrics.alias;
  }
  // if (metrics.display_name.length === metrics.alias.length) {
  //   return metrics.display_name;
  // }
  // return `${metrics.display_name} (${metrics.alias})`;
  return metrics.display_name;
}

function TitleLabel_({ metrics }: { metrics: RouteUptimeAggregate }) {
  return (
    <Label fontSize={"md"} title={metrics.alias}>
      {title(metrics)}
    </Label>
  );
}

const TitleLabel = memo(
  TitleLabel_,
  (prev, next) => title(prev.metrics) === title(next.metrics),
);

interface RouteUptimeProps extends CardRootProps {
  metrics: RouteUptimeAggregate;
}

function RouteUptime({ metrics, ...props }: RouteUptimeProps) {
  return (
    <Card.Root size="sm" minW="300px" maxW="full" maxH="180px" {...props}>
      <Card.Header>
        <HStack justify={"space-between"}>
          <Group overflow={"hidden"}>
            <FavIcon
              size="24px"
              item={{ alias: metrics.alias } as HomepageItem}
            />
            <TitleLabel metrics={metrics} />
          </Group>
          <HealthStatusTag
            value={metrics.statuses[metrics.statuses.length - 1]!.status}
          />
        </HStack>
      </Card.Header>
      <Card.Body>
        <UptimeTracker alias={metrics.alias} statuses={metrics.statuses} />
      </Card.Body>
      <Card.Footer>
        <HStack gap="2" w="full" justify={"space-between"}>
          <Label>Avg. Latency: {metrics.avg_latency.toFixed(0)}ms</Label>
          <HStack gap="2">
            {metrics.uptime > 0 && (
              <Label>{`${formatPercent(metrics.uptime)} UP`}</Label>
            )}
            {metrics.downtime > 0 && (
              <Label>{`${formatPercent(metrics.downtime)} DOWN`}</Label>
            )}
            {metrics.idle > 0 && (
              <Label>{`${formatPercent(metrics.idle)} IDLE`}</Label>
            )}
          </HStack>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
}

function RouteUptimeSquare({ metrics, ...props }: RouteUptimeProps) {
  const squareCardSize = useSquareCardSize();
  return (
    <Card.Root
      size="sm"
      w={`${squareCardSize.val}px`}
      h={`${squareCardSize.val}px`}
      overflow={"hidden"}
      {...props}
    >
      <Card.Body>
        <HealthStatus
          value={metrics.statuses[metrics.statuses.length - 1]!.status}
        />
        <Center h="full">
          <Stack gap="4" justify={"center"} align={"center"}>
            <FavIcon
              size={`${squareCardSize.val / 2.5}px`}
              item={{ alias: metrics.alias } as HomepageItem}
            />
            <Label w={`${squareCardSize.val * 0.85}px`} textAlign={"center"}>
              {title(metrics)}
            </Label>
          </Stack>
        </Center>
        <HStack gap="2" w="full" justify={"space-between"} pt="1">
          <Label>{metrics.avg_latency.toFixed(0)}ms</Label>
          <HStack gap="2">
            {metrics.uptime > 0 && (
              <Label>{`${formatPercent(metrics.uptime)} UP`}</Label>
            )}
            {metrics.downtime > 0 && (
              <Label>{`${formatPercent(metrics.downtime)} DOWN`}</Label>
            )}
            {metrics.idle > 0 && (
              <Label>{`${formatPercent(metrics.idle)} IDLE`}</Label>
            )}
          </HStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

function RouteUptimeMinimal({ metrics, ...props }: RouteUptimeProps) {
  return (
    <Card.Root size="sm" maxH="180px" {...props}>
      <Card.Body>
        <HStack w="full" justifyContent={"space-between"}>
          <HStack gap="2" overflow={"hidden"}>
            <FavIcon
              size="26px"
              item={{ alias: metrics.alias } as HomepageItem}
            />
            <TitleLabel metrics={metrics} />
          </HStack>
          <HealthStatusTag
            fontSize={"sm"}
            value={metrics.statuses[metrics.statuses.length - 1]!.status}
          />
        </HStack>
      </Card.Body>
      <Card.Footer>
        <HStack gap="2" w="full" justify={"space-between"}>
          <Label fontSize={"xs"}>
            Avg. Latency: {metrics.avg_latency.toFixed(0)}ms
          </Label>
          <Stack gap="2">
            {metrics.uptime > 0 && (
              <Label
                fontSize={"xs"}
              >{`${formatPercent(metrics.uptime)} UP`}</Label>
            )}
            {metrics.downtime > 0 && (
              <Label
                fontSize={"xs"}
              >{`${formatPercent(metrics.downtime)} DOWN`}</Label>
            )}
            {metrics.idle > 0 && (
              <Label
                fontSize={"xs"}
              >{`${formatPercent(metrics.idle)} IDLE`}</Label>
            )}
          </Stack>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
}

function fillStatuses(statuses: RouteStatus[], count: number): RouteStatus[] {
  if (statuses.length >= count) {
    const every = Math.floor(statuses.length / count);
    statuses = statuses.filter((_, i) => i % every === 0);
  }
  const dummy: RouteStatus[] = [];
  for (let i = statuses.length; i < count; i++) {
    dummy.push({
      timestamp: 0,
      status: "unknown",
      latency: 0,
    });
  }
  return [...dummy, ...statuses];
}

function UptimeTracker({
  alias,
  statuses,
}: {
  alias: string;
  statuses: RouteStatus[];
}) {
  const { width } = useWindowSize();
  const colsCount = useColsCount();
  const count = useMemo(
    () => Math.floor(width / colsCount.val / 15.5),
    [width, colsCount.val],
  );
  const statusesToShow = useMemo(
    () => fillStatuses(statuses, count),
    [statuses, count],
  );

  return (
    <HStack gap="1">
      {statusesToShow.map((s, i) => (
        <UptimeStatus key={`${alias}-${i}`} status={s} />
      ))}
    </HStack>
  );
}

const UptimeStatus = memo<{ status: RouteStatus }>(
  ({ status }) => {
    if (!status.timestamp) {
      return <Box borderRadius={"xs"} w="full" h="6" bg={"gray.500"} />;
    }
    return (
      <Tooltip
        content={`${formatTimestamp(status.timestamp)} - ${status.latency.toFixed(0)}ms`}
      >
        <Box
          borderRadius={"xs"}
          w="full"
          h="6"
          bg={healthStatusColors[status.status]}
        />
      </Tooltip>
    );
  },
  (prev, next) =>
    prev.status.timestamp === next.status.timestamp &&
    prev.status.latency === next.status.latency &&
    prev.status.status === next.status.status,
);

UptimeStatus.displayName = "UptimeStatus";
