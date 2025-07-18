import { type ColorPalette } from "@chakra-ui/react";

export const healthStatuses = [
  "healthy",
  "error",
  "unhealthy",
  "napping",
  "starting",
  "unknown",
  "stopped",
] as const;
export type HealthStatusType = (typeof healthStatuses)[number];

export const healthStatusColorPalettes: Record<HealthStatusType, ColorPalette> =
  {
    healthy: "green",
    napping: "yellow",
    unhealthy: "orange",
    starting: "blue",
    error: "red",
    unknown: "gray",
    stopped: "gray",
  } as const;

export const healthStatusColors: Record<HealthStatusType, string> = {
  healthy: "green.500",
  napping: "yellow.500",
  unhealthy: "orange.500",
  starting: "blue.500",
  error: "red.500",
  unknown: "gray.300",
  stopped: "gray.500",
} as const;

export type HealthInfo = {
  status: HealthStatusType;
  uptime: string;
  latency: string;
  detail: string;
};

export type HealthMap = Record<string, HealthInfo>;

export const healthInfoUnknown: HealthInfo = {
  status: "unknown",
  uptime: "n/a",
  latency: "n/a",
  detail: "n/a",
};

export function formatHealthInfo(info: HealthInfo) {
  if (info.status === "unknown") {
    return info.status;
  }
  return (
    `${info.status[0]!.toUpperCase() + info.status.slice(1)} for ${info.uptime}` +
    (info.status === "healthy" ? `, latency: ${info.latency}` : "")
  );
}
