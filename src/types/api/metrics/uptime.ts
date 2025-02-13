import { type HealthStatusType } from "../health";

export type RouteStatus = {
  status: HealthStatusType;
  latency: number;
  time: string;
};

export type RouteUptimeMetrics = {
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

export default UptimeMetrics;
