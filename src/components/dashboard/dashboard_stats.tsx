"use client";

import { StatLabel, StatRoot, StatValueText } from "@/components/ui/stat";
import useStats from "@/types/api/stats";
import { Box, For, SimpleGrid, Stack } from "@chakra-ui/react";

import dynamic from "next/dynamic";
import Conditional from "../conditional";
import { Skeleton, SkeletonText } from "../ui/skeleton";
import { DashboardFilters } from "./settings";
import { RouteStats } from "./stats";

const ProvidersGrid = dynamic(() => import("./providers_grid"), {
  ssr: false,
});

export default function DashboardStats({
  isMobile,
}: Readonly<{ isMobile: boolean }>) {
  const stats = useStats();
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
      <StatRoot>
        <StatLabel>Uptime</StatLabel>
        {stats.skeleton ? (
          <SkeletonText noOfLines={2} maxW="100px" />
        ) : (
          <Stack align={"flex-start"}>
            <For each={uptimeSplit}>
              {(uptime, index) => (
                <StatValueText key={index}>{uptime}</StatValueText>
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
        <RouteStats key="rps" label="Reverse Proxies" stats={rps} />
      </Box>
      <Box hidden={streams.total === 0 && !stats.skeleton}>
        <RouteStats key="streams" label="Streams" stats={streams} />
      </Box>
      <StatRoot>
        <StatLabel>Providers</StatLabel>
        <Conditional
          condition={isMobile}
          whenTrue={StatValueText}
          trueProps={{ value: stats.proxies.total }}
          whenFalse={ProvidersGrid}
          falseProps={{ stats: stats }}
        />
      </StatRoot>
      <DashboardFilters />
    </Conditional>
  );
}
