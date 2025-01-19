import { toaster } from "@/components/ui/toaster";
import log from "loglevel";
import { useEffect, useState } from "react";
import Endpoints, { ws } from "./endpoints";

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

export default function useHealthMap() {
  const [healthMap, setHealthMap] = useState<HealthMap>({});

  useEffect(() => {
    const socket = ws(Endpoints.HEALTH);
    socket.onmessage = (event) => {
      setHealthMap(JSON.parse(event.data as string));
    };
    socket.onerror = (event) => {
      toaster.error(event);
      log.error(event);
    };
    return () => {
      socket.close();
    };
  }, []);

  return healthMap;
}