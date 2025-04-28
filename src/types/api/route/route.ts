import { Healthcheck, LoadBalance, Routes } from "@/types/godoxy";

type Health = {
  name: string;
  config: Healthcheck.HealthcheckConfig;
  started: number;
  startedStr: string;
  status: string;
  // uptime: number;
  uptimeStr: string;
  // latency: number;
  latencyStr: string;
  // lastSeen: number;
  lastSeenStr: string;
  detail: string;
  url?: string;
  extra?: {
    config: LoadBalance.LoadBalanceConfig;
    pool: Record<string, Health>;
  };
};

type HealthResult = {
  health: Health;
  provider: string;
  lurl?: string;
  purl?: string;
};

type Container = {
  container: {
    container_name: string;
  };
};

export interface ReverseProxyRoute
  extends Routes.ReverseProxyRoute,
    HealthResult,
    Partial<Container> {}
export interface StreamRoute
  extends Routes.StreamRoute,
    HealthResult,
    Partial<Container> {}
export interface FileserverRoute
  extends Routes.FileServerRoute,
    HealthResult,
    Partial<Container> {}
