import { For, HStack, Text, VStack } from "@chakra-ui/react";

import { HealthStatus } from "@/components/health_status";
import type { RouteStats } from "@/lib/api";
import { healthStatuses, type HealthStatusType } from "@/types/api/health";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";
import { StatLabel, StatRoot, StatValueText } from "../ui/stat";
import { Tooltip } from "../ui/tooltip";

function HealthNumber({
  status,
  number,
}: Readonly<{ status: HealthStatusType; number: number }>) {
  return (
    <Tooltip content={`${number} ${status}`}>
      <HStack gap={2} hidden={number === 0}>
        <HealthStatus value={status} />
        <StatValueText>{number}</StatValueText>
      </HStack>
    </Tooltip>
  );
}

function StatusColorInfo() {
  return (
    <VStack align="flex-start" gap="2">
      <For each={healthStatuses}>
        {(status) => (
          <HStack key={status}>
            <HealthStatus value={status} />
            <Text>{status}</Text>
          </HStack>
        )}
      </For>
    </VStack>
  );
}

function HealthNumberSkeleton() {
  return (
    <HStack gap={2}>
      <SkeletonCircle size="16px" />
      <SkeletonText maxW="30px" />
    </HStack>
  );
}
export function RouteStats({
  label,
  stats,
  skeleton,
}: Readonly<{ label: string; stats: RouteStats; skeleton?: boolean }>) {
  if (skeleton) {
    return (
      <StatRoot>
        <StatLabel info={<StatusColorInfo />}>{label}</StatLabel>
        <HStack gap={4}>
          <HealthNumberSkeleton />
          <HealthNumberSkeleton />
          <HealthNumberSkeleton />
        </HStack>
      </StatRoot>
    );
  }
  return (
    <StatRoot>
      <StatLabel info={<StatusColorInfo />}>{label}</StatLabel>
      <HStack gap={4}>
        <HealthNumber status="healthy" number={stats.healthy} />
        <HealthNumber status="napping" number={stats.napping} />
        <HealthNumber status="unhealthy" number={stats.unhealthy} />
        <HealthNumber status="error" number={stats.error} />
        <HealthNumber status="unknown" number={stats.unknown} />
      </HStack>
    </StatRoot>
  );
}
