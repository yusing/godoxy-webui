"use client";

import { StatLabel, StatRoot, StatValueText } from "@/components/ui/stat";
import { skeletonStats } from "@/types/api/stats";
import { Box, For, SimpleGrid, Stack } from "@chakra-ui/react";

import { useWebSocketApi } from "@/hooks/websocket";
import type { StatsResponse } from "@/lib/api";
import { toastError } from "@/lib/toast";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Conditional from "../conditional";
import { Skeleton, SkeletonText } from "../ui/skeleton";
import { RouteStats } from "./stats";

const ProvidersGrid = dynamic(() => import("./providers_grid"), {
  ssr: false,
});

export default function DashboardStats({
  isMobile,
}: Readonly<{ isMobile: boolean }>) {
  const [stats, setStats] = useState<StatsResponse & { skeleton?: boolean }>(
    skeletonStats,
  );
  const { connectionError } = useWebSocketApi<StatsResponse>({
    endpoint: "/stats",
    onMessage: (data) => {
      setStats(data as StatsResponse);
    },
  });

  useEffect(() => {
    if (connectionError) {
      setStats(skeletonStats);
      toastError(connectionError);
    }
  }, [connectionError]);

  const rps = stats.proxies.reverse_proxies;
  const streams = stats.proxies.streams;
  const total = stats.proxies.total;
  const uptimeSplit = stats.uptime.split(" and ");

  return (
    <Conditional
      condition={!isMobile}
      whenTrue={Stack}
      trueProps={{
        align: "flex-start",
        gapY: 4,
        position: "sticky",
        top: "14",
      }}
      whenFalse={SimpleGrid}
      falseProps={{
        columns: 2,
        gapY: 4,
        gapX: 20,
        pt: "2",
      }}
    >
      <Stack>
        <StatRoot>
          <StatLabel>Uptime</StatLabel>
          {stats.skeleton ? (
            <SkeletonText noOfLines={2} maxW="100px" />
          ) : (
            <Stack align={"flex-start"}>
              <For each={uptimeSplit}>
                {(uptime, index) => (
                  <StatValueText key={index} whiteSpace={"nowrap"}>
                    {uptime}
                  </StatValueText>
                )}
              </For>
            </Stack>
          )}
        </StatRoot>
        <Box>
          <StatRoot hidden={total === 0 && !stats.skeleton}>
            <StatLabel>Running Services</StatLabel>
            <Skeleton loading={stats.skeleton === true} maxW="50px">
              <StatValueText>{total}</StatValueText>
            </Skeleton>
          </StatRoot>
        </Box>
        <Box hidden={rps.total === 0 && !stats.skeleton}>
          <RouteStats
            key="rps"
            label="Reverse Proxies"
            stats={rps}
            skeleton={stats.skeleton}
          />
        </Box>
        <Box hidden={streams.total === 0 && !stats.skeleton}>
          <RouteStats
            key="streams"
            label="Streams"
            stats={streams}
            skeleton={stats.skeleton}
          />
        </Box>
        <StatRoot>
          <StatLabel>Providers</StatLabel>
          <Conditional
            condition={isMobile}
            whenTrue={StatValueText}
            trueProps={{ value: stats.proxies.total }}
            whenFalse={ProvidersGrid}
            falseProps={{ stats }}
          />
        </StatRoot>
      </Stack>
    </Conditional>
  );
}
