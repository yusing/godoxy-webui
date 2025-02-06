import { Healthcheck, LoadBalance, Routes } from "godoxy-schemas";

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

type IdleWatcher = {
  container_name: string;
};

type HealthResult = {
  health: Health;
  idlewatcher?: IdleWatcher;
  provider: string;
  lurl?: string;
  purl?: string;
};

export type ReverseProxyRoute = Routes.ReverseProxyRoute & HealthResult;
export type StreamRoute = Routes.StreamRoute & HealthResult;
export type FileserverRoute = Routes.FileServerRoute & HealthResult;
