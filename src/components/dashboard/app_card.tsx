import { Tooltip } from "@/components/ui/tooltip";

import { FavIcon } from "./favicon";

import { HomepageItem } from "@/types/api/entry/homepage_item";
import { formatHealthInfo, HealthInfo } from "@/types/api/health";
import { HStack, Link, Show, Spacer, Stack, Text } from "@chakra-ui/react";
import { HealthStatus } from "../health_status";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";

type AppCardProps = {
  item: HomepageItem;
  health: HealthInfo;
} & React.ComponentProps<typeof HStack>;

export const AppCard: React.FC<AppCardProps> = ({ item, health, ...rest }) => {
  if (item.skeleton) {
    return (
      <HStack {...rest}>
        <SkeletonCircle size="24px" />
        <SkeletonText noOfLines={1} width="120px" />
      </HStack>
    );
  }
  return (
    <Link
      className="transform transition-transform hover:scale-110"
      href={item.url}
      variant="plain"
    >
      <HStack gap="2">
        <FavIcon item={item} size={"24px"} />
        <Tooltip content={item.url}>
          <Stack gap={0}>
            <Text fontWeight="medium">{item.name}</Text>
            <Show when={item.description}>
              <Text fontSize="sm" fontWeight="light" color="fg.muted">
                {item.description}
              </Text>
            </Show>
          </Stack>
        </Tooltip>
        <Spacer />
        {health.status !== "unknown" && (
          <Tooltip content={formatHealthInfo(health)}>
            <HealthStatus value={health.status} />
          </Tooltip>
        )}
      </HStack>
    </Link>
  );
};
