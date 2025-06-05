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
  healthy: "var(--color-success)",
  napping: "#FFFF00cc",
  unhealthy: "var(--color-warning)",
  starting: "#0000FF",
  error: "var(--color-error)",
  unknown: "#808080",
  stopped: "#808080",
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
