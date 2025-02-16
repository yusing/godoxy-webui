import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";

import useWebsocket from "@/hooks/ws";
import { formatPercent, formatTimestamp } from "@/lib/format";
import Endpoints from "@/types/api/endpoints";
import { healthStatusColors } from "@/types/api/health";
import { MetricsPeriod } from "@/types/api/metrics/metrics";
import type {
  RouteStatus,
  RouteUptimeMetrics,
} from "@/types/api/metrics/uptime";
import { UptimeMetrics } from "@/types/api/metrics/uptime";
import { HomepageItem } from "@/types/api/route/homepage_item";
import {
  Box,
  CardBody,
  CardHeader,
  CardRoot,
  Center,
  Group,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWindowSize } from "react-use";
import { FavIcon } from "../dashboard/favicon";
import { HealthStatusTag } from "../health_status";
import { EmptyState } from "../ui/empty-state";
import { Tooltip } from "../ui/tooltip";
import { useColsCount, useColsGap, useRowGap, useRowsCount } from "./settings";

export function Uptime({
  period,
  filter,
}: {
  period: MetricsPeriod;
  filter: string;
}) {
  const [page, setPage] = useState(1);
  const rowsCount = useRowsCount();
  const colsCount = useColsCount();
  const rowGap = useRowGap();
  const colsGap = useColsGap();
  const countPerPage = rowsCount.val * colsCount.val;
  const { data: uptime } = useWebsocket<UptimeMetrics>(
    Endpoints.metricsUptime(period, {
      keyword: filter,
      limit: countPerPage,
      offset: (page - 1) * countPerPage,
    }),
    { json: true },
  );

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
            <RouteUptime key={metrics.alias} metrics={metrics} />
          ))}
        </SimpleGrid>
        <HStack justify={"center"} w="full">
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </Stack>
    </PaginationRoot>
  );
}

function RouteUptime({ metrics }: { metrics: RouteUptimeMetrics }) {
  return (
    <CardRoot minW="300px" maxW="full" maxH="180px">
      <CardHeader>
        <HStack justifyContent={"space-between"}>
          <Group>
            <FavIcon
              size="24px"
              item={{ alias: metrics.alias } as HomepageItem}
            />
            <Heading as="h3" fontWeight={"medium"} title={metrics.alias}>
              {metrics.display_name || metrics.alias}
            </Heading>
          </Group>
          <HealthStatusTag
            value={metrics.statuses[metrics.statuses.length - 1]!.status}
          />
        </HStack>
      </CardHeader>
      {/* <CardBody>
        <UptimeTracker statuses={metrics.statuses} />
      </CardBody> */}
      <CardBody>
        <HStack gap="2" w="full" justify={"space-between"}>
          <Text fontWeight={"medium"} fontSize={"sm"}>
            Avg. Latency: {metrics.avg_latency.toFixed(0)}ms
          </Text>
          <HStack gap="2">
            {metrics.uptime > 0 && (
              <Text fontWeight={"medium"}>
                {`${formatPercent(metrics.uptime)} UP`}
              </Text>
            )}
            {metrics.downtime > 0 && (
              <Text fontWeight={"medium"}>
                {`${formatPercent(metrics.downtime)} DOWN`}
              </Text>
            )}
            {metrics.idle > 0 && (
              <Text fontWeight={"medium"}>
                {`${formatPercent(metrics.idle)} IDLE`}
              </Text>
            )}
          </HStack>
        </HStack>
      </CardBody>
    </CardRoot>
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

function UptimeTracker({ statuses }: { statuses: RouteStatus[] }) {
  const { width } = useWindowSize();
  const colsCount = useColsCount();

  return (
    <HStack gap="1">
      {fillStatuses(statuses, Math.floor(width / colsCount.val / 15)).map(
        (s, i) => (
          <UptimeStatus key={i} status={s} />
        ),
      )}
    </HStack>
  );
}

function UptimeStatus({ status }: { status: RouteStatus }) {
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
}
