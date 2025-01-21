export const healthStatuses = [
  "healthy",
  "error",
  "unhealthy",
  "napping",
  "starting",
  "unknown",
] as const;
export type HealthStatusType = (typeof healthStatuses)[number];

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
  return `${info.status} (for ${info.uptime}, latency: ${info.latency})`;
}
