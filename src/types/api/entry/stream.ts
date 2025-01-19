import type { IdleWatcherConfig } from "./idlewatcher_config";
import type { Raw } from "./raw";

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
  scheme: StreamScheme;
  url: string;
  listen_url: string;
  port: StreamPort;
  idlewatcher?: IdleWatcherConfig;
}
