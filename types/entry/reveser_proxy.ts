import { IdleWatcherConfig } from "./idlewatcher_config";
import { Raw } from "./raw";

export interface ReverseProxy {
  raw: Raw;
  url: string;
  idlewatcher?: IdleWatcherConfig;
}
