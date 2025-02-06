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

type ContainerInfo = {
  container_name: string;
};

type HealthResult = {
  health: Health;
  container?: ContainerInfo;
};

export type ReverseProxyRoute = Routes.ReverseProxyRoute & HealthResult;
export type StreamRoute = Routes.StreamRoute & HealthResult;
export type FileserverRoute = Routes.FileServerRoute & HealthResult;
