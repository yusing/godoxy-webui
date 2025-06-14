import {
  AccessLog,
  Healthcheck,
  Homepage,
  IdleWatcher,
  LoadBalance,
  Middlewares,
} from "@/types/godoxy";
import { Route } from "@/types/godoxy/providers/routes";
import { HealthStatusType } from "../health";

export type RouteResponse = {
  alias: string;
  provider?: string; // not available for load balancer routes
  excluded: boolean;
  scheme: Required<Route>["scheme"];
  host?: string;
  port: {
    listening: number;
    target: number;
  };
  lurl?: string; // listening url
  purl: string; // proxying url
  root?: string; // fileserver root
  no_tls_verify?: boolean;
  response_header_timeout?: string;
  path_patterns?: string[];
  rules?: string[];
  healthcheck?: Healthcheck.HealthcheckConfig;
  middlewares?: Middlewares.MiddlewaresMap;
  homepage?: Homepage.HomepageConfig;
  access_log?: AccessLog.RequestLogConfig;
  idlewatcher?: IdlewatcherConfig;
  container?: {
    docker_host: string;
    image: {
      author: string;
      name: string;
      tag: string;
    };
    container_name: string;
    container_id: string;
    agent?: {
      name: string;
      addr: string;
      version: string;
    };
    labels: Record<string, string>;
    idlewatecher_config: IdlewatcherConfig;
    mounts: string[];
    private_ports: PortMapping;
    public_ports: PortMapping;
    public_hostname: string;
    private_hostname: string;
    aliases: string[];
    is_excluded: boolean;
    is_explicit: boolean;
    is_host_network_mode: boolean;
    running: boolean;
    errors?: string;
  };
  health?: Health;
};

export type Health = {
  name: string;
  config: Healthcheck.HealthcheckConfig;
  detail?: string;
  extra?: {
    // load balancer pool
    config: LoadBalance.LoadBalanceConfig;
    pool: Record<string, Health>;
  };
  lastSeen: number;
  lastSeenStr: string;
  latency: number;
  latencyStr: string;
  started: number;
  startedStr: string;
  status: HealthStatusType;
  uptime: number;
  uptimeStr: string;
  url: string;
};

export type IdlewatcherConfig = {
  proxmox?: {
    node: string;
    vmid: number;
  };
  docker?: {
    docker_host: string;
    container_name: string;
    container_id: string;
  };
  idle_timeout: number;
  wake_timeout: number;
  stop_timeout: number;
  stop_method: IdleWatcher.StopMethod;
  stop_signal?: IdleWatcher.Signal;
  start_endpoint?: string;
};
export type PortMapping = Record<number, ContainerPort>;
export type ContainerPort = {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
};
