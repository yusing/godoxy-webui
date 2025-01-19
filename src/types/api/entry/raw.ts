import type { HealthCheckConfig } from "./healthcheck_config";
import type { HomepageItem } from "./homepage_item";
import type { LoadBalanceConfig } from "./loadbalance_config";

export interface Raw {
  alias: string;
  scheme: string;
  host: string;
  port: string;
  no_tls_verify?: boolean;
  path_patterns?: string[];
  healthcheck?: HealthCheckConfig;
  load_balance?: LoadBalanceConfig;
  middlewares?: Record<string, Record<string, unknown>>;
  homepage?: HomepageItem;
}
