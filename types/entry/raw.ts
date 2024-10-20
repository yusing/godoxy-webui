import { HealthCheckConfig } from "./healthcheck_config";
import { HomepageItem } from "./homepage_item";
import { LoadBalanceConfig } from "./loadbalance_config";

export interface Raw {
  scheme: string;
  host: string;
  port: string;
  no_tls_verify?: boolean;
  path_patterns?: string[];
  healthcheck?: HealthCheckConfig;
  load_balance?: LoadBalanceConfig;
  middlewares?: Record<string, Record<string, any>>;
  homepage?: HomepageItem;
}
