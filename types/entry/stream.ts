/*

type StreamEntry struct {
	Raw *RawEntry `json:"raw"`

	Alias       fields.Alias              `json:"alias"`
	Scheme      fields.StreamScheme       `json:"scheme"`
	URL         net.URL                   `json:"url,omitempty"`
	Host        fields.Host               `json:"host,omitempty"`
	Port        fields.StreamPort         `json:"port,omitempty"`
	HealthCheck *health.HealthCheckConfig `json:"healthcheck,omitempty"`

	Idlewatcher *idlewatcher.Config `json:"idlewatcher,omitempty"`
}


type StreamScheme struct {
	ListeningScheme Scheme `json:"listening"`
	ProxyScheme     Scheme `json:"proxy"`
}

type StreamPort struct {
	ListeningPort Port `json:"listening"`
	ProxyPort     Port `json:"proxy"`
}
*/

import { HealthCheckConfig } from "./healthcheck_config";
import { IdleWatcherConfig } from "./idlewatcher_config";
import { Raw } from "./raw";

export interface StreamScheme {
  listening: string;
  proxy: string;
}

export interface StreamPort {
  listening: number;
  proxy: number;
}

export interface StreamEntry {
  raw: Raw;
  alias: string;
  scheme: StreamScheme;
  url: string;
  host: string;
  port: StreamPort;
  healthcheck?: HealthCheckConfig;
  idlewatcher?: IdleWatcherConfig;
}
