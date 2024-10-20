import { HealthCheckConfig } from "./healthcheck_config";
import { IdleWatcherConfig } from "./idlewatcher_config";
import { LoadBalanceConfig } from "./loadbalance_config";
import { Raw } from "./raw";

/*
type ReverseProxyEntry struct { // real model after validation
	Raw *RawEntry `json:"raw"`

	Alias        fields.Alias              `json:"alias"`
	Scheme       fields.Scheme             `json:"scheme"`
	URL          net.URL                   `json:"url"`
	NoTLSVerify  bool                      `json:"no_tls_verify,omitempty"`
	PathPatterns fields.PathPatterns       `json:"path_patterns,omitempty"`
	HealthCheck  *health.HealthCheckConfig `json:"healthcheck,omitempty"`
	LoadBalance  *loadbalancer.Config      `json:"load_balance,omitempty"`
	Middlewares  docker.NestedLabelMap     `json:"middlewares,omitempty"`

	Idlewatcher *idlewatcher.Config `json:"idlewatcher,omitempty"`
}
*/

export interface ReverseProxy {
  raw: Raw;
  alias: string;
  scheme: string;
  url: string;
  path_patterns?: string[];
  healthcheck?: HealthCheckConfig;
  load_balance?: LoadBalanceConfig;
  middlewares?: Record<string, Record<string, any>>;
  idlewatcher?: IdleWatcherConfig;
}
