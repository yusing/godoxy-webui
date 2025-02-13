import { type ColorPalette } from "@chakra-ui/react";

export const healthStatuses = [
  "healthy",
  "error",
  "unhealthy",
  "napping",
  "starting",
  "unknown",
] as const;
export type HealthStatusType = (typeof healthStatuses)[number];

export const healthStatusColors: Record<HealthStatusType, ColorPalette> = {
  healthy: "green",
  napping: "yellow",
  unhealthy: "red",
  starting: "blue",
  error: "red",
  unknown: "gray",
} as const;

export type HealthInfo = {
  status: HealthStatusType;
  uptime: string;
  latency: string;
};

export type HealthMap = Record<string, HealthInfo>;

export const healthInfoUnknown: HealthInfo = {
  status: "unknown",
  uptime: "n/a",
  latency: "n/a",
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
