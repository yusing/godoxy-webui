import { HealthCheckConfig } from "../entry/healthcheck_config";
import { LoadBalanceConfig } from "../entry/loadbalance_config";

export interface Health {
  name: string;
  config: HealthCheckConfig;
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
  extra?: LoadBalanceHealthExtra;
}

export interface LoadBalanceHealthExtra {
  config: LoadBalanceConfig;
  pool: Record<string, Health>;
}
