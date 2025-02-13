import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import useWebsocket from "@/hooks/ws";
import { formatPercent } from "@/lib/format";
import Endpoints, { type MetricsPeriod } from "@/types/api/endpoints";
import { healthStatusColors } from "@/types/api/health";
import type UptimeMetrics from "@/types/api/metrics/uptime";
import type {
  RouteStatus,
  RouteUptimeMetrics,
} from "@/types/api/metrics/uptime";
import { HomepageItem } from "@/types/api/route/homepage_item";
import {
  Box,
  CardBody,
  CardFooter,
  CardHeader,
  CardRoot,
  Center,
  Group,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { FavIcon } from "../dashboard/favicon";
import { HealthStatusTag } from "../health_status";
import { EmptyState } from "../ui/empty-state";
import { Tooltip } from "../ui/tooltip";

const countPerPage = 6;
export function Uptime({
  period,
  filter,
}: {
  period: MetricsPeriod;
  filter: string;
}) {
  const [page, setPage] = React.useState(1);
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
        <HStack gap="6" wrap={"wrap"}>
          {uptime.data.map((metrics) => (
            <RouteUptime
              key={metrics.alias}
              route={metrics.alias}
              metrics={metrics}
            />
          ))}
        </HStack>
        <HStack justify={"center"} w="full">
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </Stack>
    </PaginationRoot>
  );
}

function RouteUptime({
  route,
  metrics,
}: {
  route: string;
  metrics: RouteUptimeMetrics;
}) {
  return (
    <CardRoot
      variant={"subtle"}
      bg={"bg.muted"}
      minW="400px"
      maxW="480px"
      h="180px"
    >
      <CardHeader>
        <HStack justifyContent={"space-between"}>
          <Group>
            <FavIcon size="24px" item={{ alias: route } as HomepageItem} />
            <Heading as="h3" fontWeight={"medium"}>
              {route}
            </Heading>
          </Group>
          <HealthStatusTag
            value={metrics.statuses[metrics.statuses.length - 1]!.status}
          />
        </HStack>
      </CardHeader>
      <CardBody>
        <UptimeTracker statuses={metrics.statuses} />
      </CardBody>
      <CardFooter>
        <HStack gap="2" w="full" justify={"space-between"}>
          <Text fontWeight={"medium"}>
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
      </CardFooter>
    </CardRoot>
  );
}

function fillStatuses(statuses: RouteStatus[]): RouteStatus[] {
  const count = 35;
  if (statuses.length >= count) {
    return statuses.slice(statuses.length - count);
  }
  const dummy: RouteStatus[] = [];
  for (let i = statuses.length; i < count; i++) {
    dummy.push({
      time: "",
      status: "unknown",
      latency: 0,
    });
  }
  return [...dummy, ...statuses];
}

function UptimeTracker({ statuses }: { statuses: RouteStatus[] }) {
  return (
    <HStack gap="1">
      {fillStatuses(statuses).map((s, i) => (
        <UptimeStatus key={i} status={s} />
      ))}
    </HStack>
  );
}

function UptimeStatus({ status }: { status: RouteStatus }) {
  if (!status.time) {
    return <Box borderRadius={"xs"} w="full" h="6" bg={"gray.500"} />;
  }
  return (
    <Tooltip content={`${status.time} - ${status.latency.toFixed(0)}ms`}>
      <Box
        borderRadius={"xs"}
        w="full"
        h="6"
        bg={healthStatusColors[status.status]}
        filter={"brightness(1.2)"}
      />
    </Tooltip>
  );
}
