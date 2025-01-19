"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { ProviderType } from "@/types/api/provider";
import { ProviderStats, Stats } from "@/types/api/stats";
import { useSetting } from "@/types/settings";
import { Box, For, HStack, Text, VStack } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { FaDocker, FaEllipsis, FaFile } from "react-icons/fa6";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";

const iconSize = 16;
const maxShownDefault = 4;

function generatePalette(theme: string | undefined, n: number): string[] {
  const palette: string[] = [];
  const saturation = 55; // Fixed saturation for vibrancy
  const lightness = theme === "light" ? 50 : 80;

  for (let i = 0; i < n; i++) {
    const hue = (i * 360) / n; // Spread hue evenly around the color wheel
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    palette.push(color);
  }

  return palette;
}

function providerColor(
  providerType: ProviderType,
  theme: string | undefined,
  fallback: string,
) {
  if (providerType == ProviderType.docker) {
    return theme === "dark" ? "#46ffff" : "#5491df";
  }
  return fallback;
}

function ProviderIcon({
  providerType,
  color,
}: Readonly<{ providerType: ProviderType; color: string }>) {
  if (providerType == ProviderType.docker) {
    return <FaDocker size={iconSize} color={color} />;
  }
  return <FaFile size={iconSize} color={color} />;
}

function ProviderItem({
  name,
  stats,
  color,
}: Readonly<{ name: string; stats: ProviderStats; color: string }>) {
  if (stats.skeleton) {
    return (
      <HStack gap={2}>
        <SkeletonCircle size={`${iconSize}px`} />
        <SkeletonText noOfLines={1} maxWidth="60px" />
      </HStack>
    );
  }
  return (
    <HStack gap={2}>
      <Box minW={`${iconSize}px`}>
        <ProviderIcon providerType={stats.type} color={color} />
      </Box>
      <Text truncate lineClamp="2">
        {name.endsWith("!") ? name.slice(0, -1) : name}
      </Text>
    </HStack>
  );
}

export default function ProvidersGrid({ stats }: Readonly<{ stats: Stats }>) {
  const { theme } = useTheme();
  const showAllProviders = useSetting("dashboard_showAllProviders", false);

  let providers = Object.entries(stats.proxies.providers);
  providers.sort(
    (a, b) => a[1].type.localeCompare(b[1].type) || a[0].localeCompare(b[0]),
  );

  const nMore =
    providers.length > maxShownDefault ? providers.length - maxShownDefault : 0;

  if (!showAllProviders.val) {
    providers = providers.slice(0, maxShownDefault);
  }

  const palette = generatePalette(theme, providers.length);

  return (
    <VStack
      align="flex-start"
      onClick={() => showAllProviders.set(!showAllProviders.val)}
      tabIndex={0}
      gap={2}
    >
      <For each={providers}>
        {([name, props], index) => (
          <Tooltip
            key={`provider_${name}_${index}`}
            content={`${props.reverse_proxies.total} reverse proxies, ${props.streams.total} streams`}
          >
            <ProviderItem
              name={name}
              stats={props}
              color={providerColor(props.type, theme, palette[index]!)}
            />
          </Tooltip>
        )}
      </For>
      <Tooltip content="Click to show all">
        <HStack gap={2} hidden={showAllProviders.val || nMore === 0}>
          <FaEllipsis width={iconSize} />
          <Text>{`${nMore} more`}</Text>
        </HStack>
      </Tooltip>
    </VStack>
  );
}
