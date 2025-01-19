import type { IdleWatcherConfig } from "./idlewatcher_config";
import type { Raw } from "./raw";

export interface ReverseProxy {
  raw: Raw;
  url: string;
  idlewatcher?: IdleWatcherConfig;
}
