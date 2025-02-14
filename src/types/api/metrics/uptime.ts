import { type HealthStatusType } from "../health";

type RouteStatus = {
  status: HealthStatusType;
  latency: number;
  timestamp: number;
};

type RouteUptimeMetrics = {
  alias: string;
  uptime: number;
  downtime: number;
  idle: number;
  avg_latency: number;
  statuses: RouteStatus[];
};

type UptimeMetrics = {
  total: number;
  data: RouteUptimeMetrics[];
};

export type { RouteStatus, RouteUptimeMetrics, UptimeMetrics };
