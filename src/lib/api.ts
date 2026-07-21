/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AccesslogFieldConfig {
  config: Record<string, AccesslogFieldMode>;
  default: "keep" | "drop" | "redact";
}

export type AccesslogFieldMode = "keep" | "drop" | "redact";

export interface AccesslogFields {
  cookies: AccesslogFieldConfig;
  headers: AccesslogFieldConfig;
  query: AccesslogFieldConfig;
}

export interface AccesslogFilters {
  cidr: LogFilterCIDR;
  /** header exists or header == value */
  headers: LogFilterHTTPHeader;
  host: LogFilterHost;
  method: LogFilterHTTPMethod;
  status_codes: LogFilterStatusCodeRange;
}

export interface Agent {
  addr: string;
  name: string;
  runtime: AgentContainerRuntime;
  supports_tcp_stream: boolean;
  supports_udp_stream: boolean;
  version: string;
}

export type AgentContainerRuntime = "docker" | "podman";

export interface AgentpoolAgent {
  addr: string;
  name: string;
  runtime: AgentContainerRuntime;
  supports_tcp_stream: boolean;
  supports_udp_stream: boolean;
  version: string;
}

export interface AuthUserPassAuthCallbackRequest {
  password: string;
  username: string;
}

export interface CIDR {
  /** network number */
  ip: number[];
  /** network mask */
  mask: number[];
}

export interface CertInfo {
  dns_names: string[];
  email_addresses: string[];
  issuer: string;
  not_after: number;
  not_before: number;
  subject: string;
}

export interface Container {
  agent: AgentpoolAgent;
  aliases: string[];
  container_id: string;
  container_name: string;
  docker_cfg: DockerProviderConfig;
  errors: string;
  idlewatcher_config: IdlewatcherConfig;
  image: ContainerImage;
  is_excluded: boolean;
  is_explicit: boolean;
  is_host_network_mode: boolean;
  labels: Record<string, string>;
  mounts: Record<string, string>;
  network: string;
  private_hostname: string;
  private_ports: DockerPortMapping;
  public_hostname: string;
  public_ports: DockerPortMapping;
  running: boolean;
  state: ContainerContainerState;
}

export interface ContainerBlkioStatEntry {
  major: number;
  minor: number;
  op: string;
  value: number;
}

export interface ContainerBlkioStats {
  io_merged_recursive: ContainerBlkioStatEntry[];
  io_queue_recursive: ContainerBlkioStatEntry[];
  /** number of bytes transferred to and from the block device */
  io_service_bytes_recursive: ContainerBlkioStatEntry[];
  io_service_time_recursive: ContainerBlkioStatEntry[];
  io_serviced_recursive: ContainerBlkioStatEntry[];
  io_time_recursive: ContainerBlkioStatEntry[];
  io_wait_time_recursive: ContainerBlkioStatEntry[];
  sectors_recursive: ContainerBlkioStatEntry[];
}

export interface ContainerCPUStats {
  /** CPU Usage. Linux and Windows. */
  cpu_usage: ContainerCPUUsage;
  /** Online CPUs. Linux only. */
  online_cpus: number;
  /** System Usage. Linux only. */
  system_cpu_usage: number;
  /** Throttling Data. Linux only. */
  throttling_data: ContainerThrottlingData;
}

export interface ContainerCPUUsage {
  /**
   * Total CPU time consumed per core (Linux). Not used on Windows.
   * Units: nanoseconds.
   */
  percpu_usage: number[];
  /**
   * Total CPU time consumed.
   * Units: nanoseconds (Linux)
   * Units: 100's of nanoseconds (Windows)
   */
  total_usage: number;
  /**
   * Time spent by tasks of the cgroup in kernel mode (Linux).
   * Time spent by all container processes in kernel mode (Windows).
   * Units: nanoseconds (Linux).
   * Units: 100's of nanoseconds (Windows). Not populated for Hyper-V Containers.
   */
  usage_in_kernelmode: number;
  /**
   * Time spent by tasks of the cgroup in user mode (Linux).
   * Time spent by all container processes in user mode (Windows).
   * Units: nanoseconds (Linux).
   * Units: 100's of nanoseconds (Windows). Not populated for Hyper-V Containers
   */
  usage_in_usermode: number;
}

export type ContainerContainerState =
  | "created"
  | "running"
  | "paused"
  | "restarting"
  | "removing"
  | "exited"
  | "dead";

export interface ContainerImage {
  sha256: string;
  author: string;
  name: string;
  tag: string;
  version: string;
}

export interface ContainerMemoryStats {
  /** committed bytes */
  commitbytes: number;
  /** peak committed bytes */
  commitpeakbytes: number;
  /** number of times memory usage hits limits. */
  failcnt: number;
  limit: number;
  /** maximum usage ever recorded. */
  max_usage: number;
  /** private working set */
  privateworkingset: number;
  /**
   * TODO(vishh): Export these as stronger types.
   * all the stats exported via memory.stat.
   */
  stats: Record<string, number>;
  /** current res_counter usage for memory */
  usage: number;
}

export interface ContainerNetworkStats {
  /** Endpoint ID. Not used on Linux. */
  endpoint_id: string;
  /** Instance ID. Not used on Linux. */
  instance_id: string;
  /** Bytes received. Windows and Linux. */
  rx_bytes: number;
  /** Incoming packets dropped. Windows and Linux. */
  rx_dropped: number;
  /**
   * Received errors. Not used on Windows. Note that we don't `omitempty` this
   * field as it is expected in the >=v1.21 API stats structure.
   */
  rx_errors: number;
  /** Packets received. Windows and Linux. */
  rx_packets: number;
  /** Bytes sent. Windows and Linux. */
  tx_bytes: number;
  /** Outgoing packets dropped. Windows and Linux. */
  tx_dropped: number;
  /**
   * Sent errors. Not used on Windows. Note that we don't `omitempty` this
   * field as it is expected in the >=v1.21 API stats structure.
   */
  tx_errors: number;
  /** Packets sent. Windows and Linux. */
  tx_packets: number;
}

export interface ContainerPidsStats {
  /** Current is the number of pids in the cgroup */
  current: number;
  /**
   * Limit is the hard limit on the number of pids in the cgroup.
   * A "Limit" of 0 means that there is no limit.
   */
  limit: number;
}

export interface ContainerPort {
  /** Host IP address that the container's port is mapped to */
  IP: string;
  /**
   * Port on the container
   * Required: true
   */
  PrivatePort: number;
  /** Port exposed on the host */
  PublicPort: number;
  /**
   * type
   * Required: true
   */
  Type: string;
}

export interface ContainerResponse {
  id: string;
  image: string;
  name: string;
  server: string;
  state?: ContainerState | null;
}

export type ContainerState =
  | "created"
  | "running"
  | "paused"
  | "restarting"
  | "removing"
  | "exited"
  | "dead";

export interface ContainerStats {
  paused: number;
  running: number;
  stopped: number;
  total: number;
}

export interface ContainerStatsResponse {
  blkio_stats: ContainerBlkioStats;
  /** Shared stats */
  cpu_stats: ContainerCPUStats;
  id: string;
  memory_stats: ContainerMemoryStats;
  name: string;
  networks: Record<string, ContainerNetworkStats>;
  /** Windows specific stats, not populated on Linux. */
  num_procs: number;
  /** Linux specific stats, not populated on Windows. */
  pids_stats: ContainerPidsStats;
  /** "Pre"="Previous" */
  precpu_stats: ContainerCPUStats;
  preread: string;
  /** Common stats */
  read: string;
  storage_stats: ContainerStorageStats;
}

export type ContainerStopMethod = "pause" | "stop" | "kill";

export interface ContainerStorageStats {
  read_count_normalized: number;
  read_size_bytes: number;
  write_count_normalized: number;
  write_size_bytes: number;
}

export interface ContainerThrottlingData {
  /** Number of periods with throttling active */
  periods: number;
  /** Number of periods when the container hits its throttling limit. */
  throttled_periods: number;
  /** Aggregate time the container was throttled for in nanoseconds. */
  throttled_time: number;
}

export interface DiskIOCountersStat {
  iops: number;
  /**
   * ReadCount        uint64 `json:"readCount"`
   * MergedReadCount  uint64 `json:"mergedReadCount"`
   * WriteCount       uint64 `json:"writeCount"`
   * MergedWriteCount uint64 `json:"mergedWriteCount"`
   * ReadBytes        uint64 `json:"readBytes"`
   * WriteBytes       uint64 `json:"writeBytes"`
   * ReadTime         uint64 `json:"readTime"`
   * WriteTime        uint64 `json:"writeTime"`
   * IopsInProgress   uint64 `json:"iopsInProgress"`
   * IoTime           uint64 `json:"ioTime"`
   * WeightedIO       uint64 `json:"weightedIO"`
   */
  name: string;
  /**
   * SerialNumber     string `json:"serialNumber"`
   * Label            string `json:"label"`
   */
  read_bytes: number;
  read_count: number;
  read_speed: number;
  write_bytes: number;
  write_count: number;
  write_speed: number;
}

export interface DiskUsageStat {
  free: number;
  /** interned */
  fstype: string;
  /** interned */
  path: string;
  total: number;
  used: number;
  used_percent: number;
}

export type DockerPortMapping = Record<string, ContainerPort>;

export interface DockerProviderConfig {
  tls: DockerTLSConfig;
  url: string;
}

export interface DockerTLSConfig {
  ca_file: string;
  cert_file?: string;
  key_file?: string;
}

export interface DockerapiRestartRequest {
  id: string;
  /**
   * Signal (optional) is the signal to send to the container to (gracefully)
   * stop it before forcibly terminating the container with SIGKILL after the
   * timeout expires. If not value is set, the default (SIGTERM) is used.
   */
  signal?: string;
  /**
   * Timeout (optional) is the timeout (in seconds) to wait for the container
   * to stop gracefully before forcibly terminating it with SIGKILL.
   *
   * - Use nil to use the default timeout (10 seconds).
   * - Use '-1' to wait indefinitely.
   * - Use '0' to not wait for the container to exit gracefully, and
   *   immediately proceeds to forcibly terminating the container.
   * - Other positive values are used as timeout (in seconds).
   */
  timeout?: number;
}

export interface DockerapiStartRequest {
  checkpointDir?: string;
  checkpointID?: string;
  id: string;
}

export interface DockerapiStopRequest {
  id: string;
  /**
   * Signal (optional) is the signal to send to the container to (gracefully)
   * stop it before forcibly terminating the container with SIGKILL after the
   * timeout expires. If not value is set, the default (SIGTERM) is used.
   */
  signal?: string;
  /**
   * Timeout (optional) is the timeout (in seconds) to wait for the container
   * to stop gracefully before forcibly terminating it with SIGKILL.
   *
   * - Use nil to use the default timeout (10 seconds).
   * - Use '-1' to wait indefinitely.
   * - Use '0' to not wait for the container to exit gracefully, and
   *   immediately proceeds to forcibly terminating the container.
   * - Other positive values are used as timeout (in seconds).
   */
  timeout?: number;
}

export interface ErrorResponse {
  error?: string | null;
  message: string;
}

export interface Event {
  action: string;
  category: string;
  data: any;
  level: EventsLevel;
  timestamp: string;
  uuid: string;
}

export type EventsLevel = "debug" | "info" | "warn" | "error";

export type FileType = "config" | "provider" | "middleware";

export interface FinalRequest {
  body: string;
  headers: Record<string, string[]>;
  host: string;
  method: string;
  path: string;
  query: Record<string, string[]>;
}

export interface FinalResponse {
  body: string;
  headers: Record<string, string[]>;
  statusCode: number;
}

export interface HTTPHeader {
  key: string;
  value: string;
}

export interface HealthCheckConfig {
  disable: boolean;
  interval: number;
  path: string;
  /** <0: immediate, 0: default, >0: threshold */
  retries: number;
  timeout: number;
  use_get: boolean;
}

export interface HealthExtra {
  config: LoadBalancerConfig;
  pool: Record<string, any>;
}

export interface HealthInfoWithoutDetail {
  latency: number;
  sleep_in: number;
  status:
    | "healthy"
    | "unhealthy"
    | "napping"
    | "starting"
    | "error"
    | "unknown";
  uptime: number;
}

export interface HealthJSON {
  config: HealthCheckConfig;
  detail: string;
  extra?: HealthExtra | null;
  /** unix timestamp in seconds */
  lastSeen: number;
  /** latency in milliseconds */
  latency: number;
  name: string;
  /** unix timestamp in seconds */
  started: number;
  status: HealthStatusString;
  /** uptime in seconds */
  uptime: number;
  url: string;
}

export type HealthMap = Record<string, HealthInfoWithoutDetail>;

export type HealthStatusString =
  | "unknown"
  | "healthy"
  | "napping"
  | "starting"
  | "unhealthy"
  | "error";

export interface HomepageCategory {
  items: HomepageItem[];
  name: string;
}

export interface HomepageItem {
  alias: string;
  /** sort order in all */
  all_sort_order: number;
  category: string;
  clicks: number;
  container_id?: string | null;
  description: string;
  /** sort order in favorite */
  fav_sort_order: number;
  favorite: boolean;
  icon: string;
  /** display name */
  name: string;
  origin_url: string;
  provider: string;
  show: boolean;
  /** sort order in category */
  sort_order: number;
  url: string;
  widget_config?: WidgetsConfig | null;
  widgets: HomepageItemWidget[];
}

export interface HomepageItemConfig {
  category: string;
  description: string;
  favorite: boolean;
  icon: string;
  /** display name */
  name: string;
  show: boolean;
  url: string;
  widget_config?: WidgetsConfig | null;
}

export interface HomepageItemWidget {
  label: string;
  value: string;
}

export interface HomepageOverrideCategoryOrderParams {
  value: number;
  which: string;
}

export interface HomepageOverrideItemAllSortOrderParams {
  value: number;
  which: string;
}

export interface HomepageOverrideItemFavSortOrderParams {
  value: number;
  which: string;
}

export interface HomepageOverrideItemFavoriteParams {
  value: boolean;
  which: string[];
}

export interface HomepageOverrideItemParams {
  value: HomepageItemConfig;
  which: string;
}

export interface HomepageOverrideItemSortOrderParams {
  value: number;
  which: string;
}

export interface HomepageOverrideItemVisibleParams {
  value: boolean;
  which: string[];
}

export interface HomepageOverrideItemsBatchParams {
  value: Record<string, HomepageItemConfig>;
}

export interface IconFetchResult {
  icon: number[];
  statusCode: number;
}

export interface IconMetaSearch {
  Dark: boolean;
  Light: boolean;
  PNG: boolean;
  Ref: string;
  SVG: boolean;
  Source: IconsSource;
  WebP: boolean;
}

export type IconsSource = "https://" | "@target" | "@walkxcode" | "@selfhst";

export interface IdlewatcherConfig {
  depends_on: string[];
  docker: IdlewatcherDockerConfig;
  /**
   * 0: no idle watcher.
   * Positive: idle watcher with idle timeout.
   * Negative: idle watcher as a dependency.
   */
  idle_timeout: TimeDuration;
  no_loading_page: boolean;
  proxmox: IdlewatcherProxmoxNodeConfig;
  /** Optional path that must be hit to start container */
  start_endpoint: string;
  stop_method: ContainerStopMethod;
  stop_signal: string;
  stop_timeout: TimeDuration;
  wake_timeout: TimeDuration;
}

export interface IdlewatcherDockerConfig {
  container_id: string;
  container_name: string;
  docker_cfg: DockerProviderConfig;
}

export interface IdlewatcherProxmoxNodeConfig {
  node: string;
  vmid: number;
}

export interface ListFilesResponse {
  config: string[];
  middleware: string[];
  provider: string[];
}

export interface LoadBalancerConfig {
  link: string;
  mode: LoadBalancerMode;
  options: Record<string, any>;
  sticky: boolean;
  sticky_max_age: TimeDuration;
  weight: number;
}

export type LoadBalancerMode = "" | "roundrobin" | "leastconn" | "iphash";

export interface LogFilterCIDR {
  negative: boolean;
  values: CIDR[];
}

export interface LogFilterHTTPHeader {
  negative: boolean;
  values: HTTPHeader[];
}

export interface LogFilterHTTPMethod {
  negative: boolean;
  values: string[];
}

export interface LogFilterHost {
  negative: boolean;
  values: string[];
}

export interface LogFilterStatusCodeRange {
  negative: boolean;
  values: StatusCodeRange[];
}

export interface LogRetention {
  /** @min 0 */
  days: number;
  /** @min 0 */
  keep_size: number;
  /** @min 0 */
  last: number;
}

export interface MemVirtualMemoryStat {
  /**
   * RAM available for programs to allocate
   *
   * This value is computed from the kernel specific values.
   */
  available: number;
  /** Total amount of RAM on this system */
  total: number;
  /**
   * RAM used by programs
   *
   * This value is computed from the kernel specific values.
   */
  used: number;
  /**
   * Percentage of RAM used by programs
   *
   * This value is computed from the kernel specific values.
   */
  used_percent: number;
}

export type MetricsPeriod = "5m" | "15m" | "1h" | "1d" | "1mo";

export interface MockCookie {
  name: string;
  value: string;
}

export interface MockRequest {
  body: string;
  cookies: MockCookie[];
  headers: Record<string, string[]>;
  host: string;
  method: string;
  path: string;
  query: Record<string, string[]>;
  remoteIP: string;
}

export interface MockResponse {
  body: string;
  headers: Record<string, string[]>;
  statusCode: number;
}

export interface NetIOCountersStat {
  /** number of bytes received */
  bytes_recv: number;
  /** Name      string `json:"name"`       // interface name */
  bytes_sent: number;
  /** godoxy */
  download_speed: number;
  /** godoxy */
  upload_speed: number;
}

export interface NewAgentRequest {
  /** @default "docker" */
  container_runtime?: "docker" | "podman";
  host: string;
  name: string;
  nightly?: boolean;
  /**
   * @min 1
   * @max 65535
   */
  port: number;
  type: "docker" | "system";
}

export interface NewAgentResponse {
  ca: PEMPairResponse;
  client: PEMPairResponse;
  compose: string;
}

export interface PEMPairResponse {
  /** @format base64 */
  cert: string;
  /** @format base64 */
  key: string;
}

export interface ParsedRule {
  do: string;
  name: string;
  on: string;
  /** we need the structured error, not the plain string */
  validationError: any;
}

export interface PlaygroundRequest {
  mockRequest?: MockRequest;
  mockResponse?: MockResponse;
  rules: string;
}

export interface PlaygroundResponse {
  /** we need the structured error, not the plain string */
  executionError: any;
  finalRequest: FinalRequest;
  finalResponse: FinalResponse;
  matchedRules: string[];
  parsedRules: ParsedRule[];
  upstreamCalled: boolean;
}

export interface Port {
  listening: number;
  proxy: number;
}

export interface ProviderStats {
  reverse_proxies: RouteStats;
  streams: RouteStats;
  total: number;
  type: ProviderType;
}

export type ProviderType = "docker" | "file" | "agent";

export interface ProxmoxNodeConfig {
  files: string[];
  node: string;
  services: string[];
  /** unset: auto discover; explicit 0: node-level route; >0: lxc/qemu resource route */
  vmid: number;
  vmname: string;
}

export interface ProxmoxNodeStats {
  load_avg_15m: string;
  load_avg_1m: string;
  load_avg_5m: string;
  cpu_model: string;
  cpu_usage: string;
  kernel_version: string;
  mem_pct: string;
  mem_total: string;
  mem_usage: string;
  pve_version: string;
  rootfs_pct: string;
  rootfs_total: string;
  rootfs_usage: string;
  uptime: string;
}

export interface ProxyStats {
  providers: Record<string, ProviderStats>;
  reverse_proxies: RouteStats;
  streams: RouteStats;
  total: number;
}

export interface RequestLoggerConfig {
  fields: AccesslogFields;
  filters: AccesslogFilters;
  format: "common" | "combined" | "json";
  path: string;
  retention: LogRetention;
  rotate_interval: number;
  stdout: boolean;
}

export interface Route {
  access_log?: RequestLoggerConfig | null;
  agent: string;
  /**
   * Alias is route lookup key.
   *
   * Supported HTTP host-match forms:
   *   - short alias: "app"
   *   - FQDN alias: "app.example.com"
   *   - leading-label wildcard alias: "*.example.com"
   *
   * Wildcard aliases match exactly one leftmost label and are checked only
   * after normal exact/domain lookup misses, preserving the fast path for
   * exact routes.
   */
  alias: string;
  bind?: string | null;
  /** Docker only */
  container?: Container | null;
  disable_compression: boolean;
  excluded?: boolean | null;
  excluded_reason?: string | null;
  /** for swagger */
  health: HealthJSON;
  /** null on load-balancer routes */
  healthcheck?: HealthCheckConfig | null;
  homepage: HomepageItemConfig;
  host: string;
  idlewatcher?: IdlewatcherConfig | null;
  /** HTTP-based routes only: must match a configured inbound_mtls_profiles entry and is ignored when entrypoint.inbound_mtls_profile is set */
  inbound_mtls_profile: string;
  /** Index file to serve for single-page app mode */
  index: string;
  load_balance?: LoadBalancerConfig | null;
  lurl?: string | null;
  max_conns_per_host: number;
  middlewares?: Record<string, TypesLabelMap> | null;
  no_tls_verify: boolean;
  port: Port;
  /** for backward compatibility */
  provider?: string | null;
  proxmox?: ProxmoxNodeConfig | null;
  purl: string;
  /** TCP only: relay PROXY protocol header to the destination */
  relay_proxy_protocol_header: boolean;
  response_header_timeout: number;
  root: string;
  rule_file?: string | null;
  rules?: RulesRule[] | null;
  scheme: "http" | "https" | "h2c" | "tcp" | "udp" | "fileserver";
  /** Single-page app mode: serves index for non-existent paths */
  spa: boolean;
  /** Path to client certificate */
  ssl_certificate: string;
  /** Path to client certificate key */
  ssl_certificate_key: string;
  /** Allowed TLS protocols */
  ssl_protocols: string[];
  /** SSL/TLS proxy options (nginx-like) */
  ssl_server_name: string;
  /** Path to trusted CA certificates */
  ssl_trusted_certificate: string;
  /** TCP only: terminate inbound TLS on the shared HTTPS listener before proxying plaintext to the destination */
  tls_termination: boolean;
}

export type RouteApiRoutesByProvider = Record<string, Route[]>;

export interface RouteProvider {
  full_name: string;
  short_name: string;
}

export interface RouteStats {
  error: number;
  healthy: number;
  napping: number;
  total: number;
  unhealthy: number;
  unknown: number;
}

export interface RouteStatus {
  latency: number;
  status: "healthy" | "unhealthy" | "unknown" | "napping" | "starting";
  timestamp: number;
}

export interface RouteStatusesByAlias {
  statuses: Record<string, HealthInfoWithoutDetail>;
  timestamp: number;
}

export interface RouteUptimeAggregate {
  alias: string;
  avg_latency: number;
  current_status: "healthy" | "unhealthy" | "unknown" | "napping" | "starting";
  downtime: number;
  idle: number;
  statuses: RouteStatus[];
  uptime: number;
}

export interface RulesRule {
  do: string;
  name: string;
  on: string;
}

export interface SensorsTemperatureStat {
  critical: number;
  high: number;
  /** interned */
  name: string;
  temperature: number;
}

export interface ServerInfo {
  containers: ContainerStats;
  images: number;
  memory: string;
  n_cpu: number;
  name: string;
  version: string;
}

export interface StatsResponse {
  proxies: ProxyStats;
  uptime: number;
}

export interface StatusCodeRange {
  end: number;
  start: number;
}

export interface SuccessResponse {
  details?: Record<string, any> | null;
  message: string;
}

export interface SystemInfo {
  cpu_average: number;
  /** disk usage by partition */
  disks: Record<string, DiskUsageStat>;
  /** disk IO by device */
  disks_io: Record<string, DiskIOCountersStat>;
  memory: MemVirtualMemoryStat;
  network: NetIOCountersStat;
  /** sensor temperature by key */
  sensors: SensorsTemperatureStat[];
  timestamp: number;
}

export interface SystemInfoAggregate {
  data: Record<string, any>[];
  total: number;
}

export type SystemInfoAggregateMode =
  | "cpu_average"
  | "memory_usage"
  | "memory_usage_percent"
  | "disks_read_speed"
  | "disks_write_speed"
  | "disks_iops"
  | "disk_usage"
  | "network_speed"
  | "network_transfer"
  | "sensor_temperature";

/** @format int64 */
export type TimeDuration =
  | -9223372036854776000
  | 9223372036854776000
  | 1
  | 1000
  | 1000000
  | 1000000000
  | 60000000000
  | 3600000000000;

export type TypesLabelMap = Record<string, any>;

export interface UptimeAggregate {
  data: RouteUptimeAggregate[];
  total: number;
}

export interface VerifyNewAgentRequest {
  add_to_config: boolean;
  ca: PEMPairResponse;
  client: PEMPairResponse;
  container_runtime: AgentContainerRuntime;
  host: string;
}

export interface VerifyNewAgentResponse {
  agents: Agent[];
  message: string;
}

export interface WidgetsConfig {
  config: any;
  provider: string;
}

export namespace Agent {
  /**
   * @description Create a new agent and return the docker compose file, encrypted CA and client PEMs The returned PEMs are encrypted with a random key and will be used for verification when adding a new agent
   * @tags agent
   * @name Create
   * @summary Create a new agent
   * @request POST:/agent/create
   * @response `200` `NewAgentResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `409` `ErrorResponse` Conflict
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Create {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NewAgentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = NewAgentResponse;
  }

  /**
   * @description List agents
   * @tags agent, websocket
   * @name List
   * @summary List agents
   * @request GET:/agent/list
   * @response `200` `(Agent)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace List {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Agent[];
  }

  /**
   * @description Verify a new agent and return the number of routes added
   * @tags agent
   * @name Verify
   * @summary Verify a new agent
   * @request POST:/agent/verify
   * @response `200` `VerifyNewAgentResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Verify {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyNewAgentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyNewAgentResponse;
  }
}

export namespace Auth {
  /**
   * @description Handles the callback from the provider after successful authentication
   * @tags auth
   * @name Callback
   * @summary Auth Callback
   * @request POST:/auth/callback
   * @response `200` `string` Userpass: OK
   * @response `302` `string` OIDC: Redirects to home page
   * @response `400` `string` Userpass: invalid request / credentials
   * @response `500` `string` Internal server error
   */
  export namespace Callback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AuthUserPassAuthCallbackRequest;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Checks if the user is authenticated by validating their token
   * @tags auth
   * @name Check
   * @summary Check authentication status
   * @request HEAD:/auth/check
   * @response `200` `string` OK
   * @response `302` `string` Redirects to login page or IdP
   */
  export namespace Check {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Initiates the login process by redirecting the user to the provider's login page
   * @tags auth
   * @name Login
   * @summary Login
   * @request POST:/auth/login
   * @response `302` `string` Redirects to login page or IdP
   * @response `429` `string` Too Many Requests
   */
  export namespace Login {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Logs out the user by invalidating the token
   * @tags auth
   * @name Logout
   * @summary Logout
   * @request POST:/auth/logout
   * @response `302` `string` Redirects to home page
   */
  export namespace Logout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace Cert {
  /**
   * @description Get cert info
   * @tags cert
   * @name Info
   * @summary Get cert info
   * @request GET:/cert/info
   * @response `200` `(CertInfo)[]` OK
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` No certificates found or autocert is not enabled
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CertInfo[];
  }

  /**
   * @description Renew cert
   * @tags cert, websocket
   * @name Renew
   * @summary Renew cert
   * @request GET:/cert/renew
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Renew {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }
}

export namespace Docker {
  /**
   * @description Get container by container id
   * @tags docker
   * @name Container
   * @summary Get container
   * @request GET:/docker/container/{id}
   * @response `200` `ContainerResponse` OK
   * @response `400` `ErrorResponse` ID is required
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Container {
    export type RequestParams = {
      /** Container ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ContainerResponse;
  }

  /**
   * @description Get containers
   * @tags docker
   * @name Containers
   * @summary Get containers
   * @request GET:/docker/containers
   * @response `200` `(ContainerResponse)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Containers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ContainerResponse[];
  }

  /**
   * @description Get docker info
   * @tags docker
   * @name Info
   * @summary Get docker info
   * @request GET:/docker/info
   * @response `200` `ServerInfo` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ServerInfo;
  }

  /**
   * @description Get docker container logs by container id
   * @tags docker, websocket
   * @name Logs
   * @summary Get docker container logs
   * @request GET:/docker/logs/{id}
   * @response `200` `void` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` server not found or container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Logs {
    export type RequestParams = {
      /** container id */
      id: string;
    };
    export type RequestQuery = {
      /** from timestamp */
      from?: string;
      /** levels */
      levels?: string;
      /** limit */
      limit?: number;
      /** show stderr */
      stderr?: boolean;
      /** show stdout */
      stdout?: boolean;
      /** to timestamp */
      to?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Restart container by container id
   * @tags docker
   * @name Restart
   * @summary Restart container
   * @request POST:/docker/restart
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Restart {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DockerapiRestartRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Start container by container id
   * @tags docker
   * @name Start
   * @summary Start container
   * @request POST:/docker/start
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Start {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DockerapiStartRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Get container stats by container id
   * @tags docker, websocket
   * @name StatsDetail
   * @summary Get container stats
   * @request GET:/docker/stats/{id}
   * @response `200` `ContainerStatsResponse` OK
   * @response `400` `ErrorResponse` Invalid request: id is required or route is not a docker container
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace StatsDetail {
    export type RequestParams = {
      /** Container ID or route alias */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ContainerStatsResponse;
  }

  /**
   * @description Stop container by container id
   * @tags docker
   * @name Stop
   * @summary Stop container
   * @request POST:/docker/stop
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Container not found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Stop {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DockerapiStopRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }
}

export namespace Events {
  /**
   * No description
   * @tags v1
   * @name Events
   * @summary Get events history
   * @request GET:/events
   * @response `200` `(Event)[]` OK
   * @response `403` `ErrorResponse` Forbidden: unauthorized
   * @response `500` `ErrorResponse` Internal Server Error: internal error
   */
  export namespace Events {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Event[];
  }
}

export namespace Favicon {
  /**
   * @description Get favicon
   * @tags v1
   * @name Favicon
   * @summary Get favicon
   * @request GET:/favicon
   * @response `200` `(IconFetchResult)[]` OK
   * @response `400` `ErrorResponse` Bad Request: alias is empty or route is not HTTPRoute
   * @response `403` `ErrorResponse` Forbidden: unauthorized
   * @response `404` `ErrorResponse` Not Found: route or icon not found
   * @response `500` `ErrorResponse` Internal Server Error: internal error
   */
  export namespace Favicon {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Alias of the route */
      alias?: string;
      /** URL of the route */
      url?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = IconFetchResult[];
  }
}

export namespace File {
  /**
   * @description Get file content
   * @tags file
   * @name Get
   * @summary Get file content
   * @request GET:/file/content
   * @response `200` `string` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Get {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @format filename */
      filename: string;
      type: "config" | "provider" | "middleware";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Set file content
   * @tags file
   * @name Set
   * @summary Set file content
   * @request PUT:/file/content
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Set {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Filename */
      filename: string;
      /** Type */
      type: "config" | "provider" | "middleware";
    };
    export type RequestBody = string;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description List files
   * @tags file
   * @name List
   * @summary List files
   * @request GET:/file/list
   * @response `200` `ListFilesResponse` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace List {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListFilesResponse;
  }

  /**
   * @description Validate file
   * @tags file
   * @name Validate
   * @summary Validate file
   * @request POST:/file/validate
   * @response `200` `SuccessResponse` File validated
   * @response `400` `ErrorResponse` Bad request
   * @response `403` `ErrorResponse` Forbidden
   * @response `417` `any` Validation failed
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Validate {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Type */
      type: "config" | "provider" | "middleware";
    };
    export type RequestBody = string;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }
}

export namespace Health {
  /**
   * @description Get health info by route name
   * @tags v1, websocket
   * @name Health
   * @summary Get routes health info
   * @request GET:/health
   * @response `200` `HealthMap` Health info by route name
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HealthMap;
  }
}

export namespace Homepage {
  /**
   * @description List homepage categories
   * @tags homepage
   * @name Categories
   * @summary List homepage categories
   * @request GET:/homepage/categories
   * @response `200` `(string)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string[];
  }

  /**
   * @description Increment item click.
   * @tags homepage
   * @name ItemClick
   * @summary Increment item click
   * @request POST:/homepage/item_click
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace ItemClick {
    export type RequestParams = {};
    export type RequestQuery = {
      which: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Homepage items
   * @tags homepage, websocket
   * @name Items
   * @summary Homepage items
   * @request GET:/homepage/items
   * @response `200` `(HomepageCategory)[]` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Items {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category filter */
      category?: string;
      /** Provider filter */
      provider?: string;
      /** Search query */
      search?: string;
      /**
       * Sort method
       * @default "alphabetical"
       */
      sort_method?: "clicks" | "alphabetical" | "custom";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HomepageCategory[];
  }

  /**
   * @description Set homepage category order.
   * @tags homepage
   * @name SetCategoryOrder
   * @summary Set homepage category order
   * @request POST:/homepage/set/category_order
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetCategoryOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideCategoryOrderParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Override single homepage item.
   * @tags homepage
   * @name SetItem
   * @summary Override single homepage item
   * @request POST:/homepage/set/item
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItem {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Set homepage item all sort order.
   * @tags homepage
   * @name SetItemAllSortOrder
   * @summary Set homepage item all sort order
   * @request POST:/homepage/set/item_all_sort_order
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemAllSortOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemAllSortOrderParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Set homepage item fav sort order.
   * @tags homepage
   * @name SetItemFavSortOrder
   * @summary Set homepage item fav sort order
   * @request POST:/homepage/set/item_fav_sort_order
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemFavSortOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemFavSortOrderParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Set homepage item favorite.
   * @tags homepage
   * @name SetItemFavorite
   * @summary Set homepage item favorite
   * @request POST:/homepage/set/item_favorite
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemFavorite {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemFavoriteParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Set homepage item sort order.
   * @tags homepage
   * @name SetItemSortOrder
   * @summary Set homepage item sort order
   * @request POST:/homepage/set/item_sort_order
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemSortOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemSortOrderParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description POST list of item ids and visibility value.
   * @tags homepage
   * @name SetItemVisible
   * @summary Set homepage item visibility
   * @request POST:/homepage/set/item_visible
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemVisible {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemVisibleParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Override multiple homepage items.
   * @tags homepage
   * @name SetItemsBatch
   * @summary Override multiple homepage items
   * @request POST:/homepage/set/items_batch
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SetItemsBatch {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageOverrideItemsBatchParams;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }
}

export namespace Icons {
  /**
   * @description List icons
   * @tags v1
   * @name Icons
   * @summary List icons
   * @request GET:/icons
   * @response `200` `(IconMetaSearch)[]` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace Icons {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Keyword */
      keyword?: string;
      /** Limit */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = IconMetaSearch[];
  }
}

export namespace Metrics {
  /**
   * @description Get system info
   * @tags metrics, websocket
   * @name AllSystemInfo
   * @summary Get system info
   * @request GET:/metrics/all_system_info
   * @response `200` `Record<string,SystemInfoAggregate>` period specified, aggregated system info by agent name
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace AllSystemInfo {
    export type RequestParams = {};
    export type RequestQuery = {
      aggregate?:
        | "cpu_average"
        | "memory_usage"
        | "memory_usage_percent"
        | "disks_read_speed"
        | "disks_write_speed"
        | "disks_iops"
        | "disk_usage"
        | "network_speed"
        | "network_transfer"
        | "sensor_temperature";
      /** @format duration */
      interval?: string;
      period?: "5m" | "15m" | "1h" | "1d" | "1mo";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, SystemInfoAggregate>;
  }

  /**
   * @description Get system info
   * @tags metrics, websocket
   * @name SystemInfo
   * @summary Get system info
   * @request GET:/metrics/system_info
   * @response `200` `SystemInfoAggregate` period specified
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Not Found
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace SystemInfo {
    export type RequestParams = {};
    export type RequestQuery = {
      agentAddr?: string;
      agentName?: string;
      aggregate?:
        | "cpu_average"
        | "memory_usage"
        | "memory_usage_percent"
        | "disks_read_speed"
        | "disks_write_speed"
        | "disks_iops"
        | "disk_usage"
        | "network_speed"
        | "network_transfer"
        | "sensor_temperature";
      period?: "5m" | "15m" | "1h" | "1d" | "1mo";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SystemInfoAggregate;
  }

  /**
   * @description Get uptime
   * @tags metrics, websocket
   * @name Uptime
   * @summary Get uptime
   * @request GET:/metrics/uptime
   * @response `200` `UptimeAggregate` period specified
   * @response `204` `ErrorResponse` No Content
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Uptime {
    export type RequestParams = {};
    export type RequestQuery = {
      /** @example "1m" */
      interval?: "5m" | "15m" | "1h" | "1d" | "1mo";
      /** @example "" */
      keyword?: string;
      /**
       * @default 0
       * @example 10
       */
      limit?: number;
      /**
       * @default 0
       * @example 10
       */
      offset?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UptimeAggregate;
  }
}

export namespace Proxmox {
  /**
   * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
   * @tags proxmox, websocket
   * @name Journalctl
   * @summary Get journalctl output
   * @request GET:/proxmox/journalctl
   * @response `200` `string` Journalctl output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Journalctl {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Limit output lines (1-1000)
       * @min 1
       * @max 1000
       * @default 100
       */
      limit?: number;
      /** Node name */
      node: string;
      /** Service names */
      service?: string[];
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
   * @tags proxmox, websocket
   * @name Journalctl2
   * @summary Get journalctl output
   * @request GET:/proxmox/journalctl/{node}
   * @originalName journalctl
   * @duplicate
   * @response `200` `string` Journalctl output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Journalctl2 {
    export type RequestParams = {
      /** Node name */
      node: string;
    };
    export type RequestQuery = {
      /**
       * Limit output lines (1-1000)
       * @min 1
       * @max 1000
       * @default 100
       */
      limit?: number;
      /** Node name */
      node: string;
      /** Service names */
      service?: string[];
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
   * @tags proxmox, websocket
   * @name Journalctl3
   * @summary Get journalctl output
   * @request GET:/proxmox/journalctl/{node}/{vmid}
   * @originalName journalctl
   * @duplicate
   * @response `200` `string` Journalctl output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Journalctl3 {
    export type RequestParams = {
      /** Node name */
      node: string;
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestQuery = {
      /**
       * Limit output lines (1-1000)
       * @min 1
       * @max 1000
       * @default 100
       */
      limit?: number;
      /** Node name */
      node: string;
      /** Service names */
      service?: string[];
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
   * @tags proxmox, websocket
   * @name Journalctl4
   * @summary Get journalctl output
   * @request GET:/proxmox/journalctl/{node}/{vmid}/{service}
   * @originalName journalctl
   * @duplicate
   * @response `200` `string` Journalctl output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Journalctl4 {
    export type RequestParams = {
      /** Node name */
      node: string;
      /** Service names */
      service?: string[];
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestQuery = {
      /**
       * Limit output lines (1-1000)
       * @min 1
       * @max 1000
       * @default 100
       */
      limit?: number;
      /** Node name */
      node: string;
      /** Service names */
      service?: string[];
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Restart LXC container by node and vmid
   * @tags proxmox
   * @name LxcRestart
   * @summary Restart LXC container
   * @request POST:/proxmox/lxc/:node/:vmid/restart
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace LxcRestart {
    export type RequestParams = {
      node: string;
      vmid: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Start LXC container by node and vmid
   * @tags proxmox
   * @name LxcStart
   * @summary Start LXC container
   * @request POST:/proxmox/lxc/:node/:vmid/start
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace LxcStart {
    export type RequestParams = {
      node: string;
      vmid: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Stop LXC container by node and vmid
   * @tags proxmox
   * @name LxcStop
   * @summary Stop LXC container
   * @request POST:/proxmox/lxc/:node/:vmid/stop
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Invalid request
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace LxcStop {
    export type RequestParams = {
      node: string;
      vmid: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Get proxmox node stats in json
   * @tags proxmox, websocket
   * @name NodeStats
   * @summary Get proxmox node stats
   * @request GET:/proxmox/stats/{node}
   * @response `200` `ProxmoxNodeStats` Stats output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace NodeStats {
    export type RequestParams = {
      /** Node name */
      node: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ProxmoxNodeStats;
  }

  /**
   * @description Get proxmox VM stats in format of "STATUS|CPU%%|MEM USAGE/LIMIT|MEM%%|NET I/O|BLOCK I/O"
   * @tags proxmox, websocket
   * @name VmStats
   * @summary Get proxmox VM stats
   * @request GET:/proxmox/stats/{node}/{vmid}
   * @response `200` `string` Stats output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace VmStats {
    export type RequestParams = {
      node: string;
      vmid: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description Get tail output for node or LXC container. If vmid is not provided, streams node tail.
   * @tags proxmox, websocket
   * @name Tail
   * @summary Get tail output
   * @request GET:/proxmox/tail
   * @response `200` `string` Tail output
   * @response `400` `ErrorResponse` Invalid request
   * @response `403` `ErrorResponse` Unauthorized
   * @response `404` `ErrorResponse` Node not found
   * @response `409` `ErrorResponse` Node name is ambiguous
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Tail {
    export type RequestParams = {};
    export type RequestQuery = {
      /** File paths */
      file: string[];
      /**
       * Limit output lines (1-1000)
       * @min 1
       * @max 1000
       * @default 100
       */
      limit?: number;
      /** Node name */
      node: string;
      /** Container VMID (optional - if not provided, streams node journalctl) */
      vmid?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }
}

export namespace Route {
  /**
   * @description List routes by provider
   * @tags route
   * @name ByProvider
   * @summary List routes by provider
   * @request GET:/route/by_provider
   * @response `200` `RouteApiRoutesByProvider` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace ByProvider {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RouteApiRoutesByProvider;
  }

  /**
   * @description List routes
   * @tags route, websocket
   * @name List
   * @summary List routes
   * @request GET:/route/list
   * @response `200` `(Route)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace List {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Provider */
      provider?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Route[];
  }

  /**
   * @description Test rules against mock request/response
   * @tags route
   * @name Playground
   * @summary Rule Playground
   * @request POST:/route/playground
   * @response `200` `PlaygroundResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace Playground {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PlaygroundRequest;
    export type RequestHeaders = {};
    export type ResponseBody = PlaygroundResponse;
  }

  /**
   * @description List route providers
   * @tags route, websocket
   * @name Providers
   * @summary List route providers
   * @request GET:/route/providers
   * @response `200` `(RouteProvider)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Providers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RouteProvider[];
  }

  /**
   * @description Validate route,
   * @tags route, websocket
   * @name Validate
   * @summary Validate route
   * @request GET:/route/validate
   * @response `200` `SuccessResponse` Route validated
   * @response `400` `ErrorResponse` Bad request
   * @response `403` `ErrorResponse` Forbidden
   * @response `417` `any` Validation failed
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Validate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Route;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description Validate route,
   * @tags route, websocket
   * @name Validate2
   * @summary Validate route
   * @request POST:/route/validate
   * @originalName validate
   * @duplicate
   * @response `200` `SuccessResponse` Route validated
   * @response `400` `ErrorResponse` Bad request
   * @response `403` `ErrorResponse` Forbidden
   * @response `417` `any` Validation failed
   * @response `500` `ErrorResponse` Internal server error
   */
  export namespace Validate2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Route;
    export type RequestHeaders = {};
    export type ResponseBody = SuccessResponse;
  }

  /**
   * @description List route
   * @tags route
   * @name Route
   * @summary List route
   * @request GET:/route/{which}
   * @response `200` `Route` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `404` `ErrorResponse` Not Found
   */
  export namespace Route {
    export type RequestParams = {
      /** Route name */
      which: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Route;
  }
}

export namespace Stats {
  /**
   * @description Get stats
   * @tags v1, websocket
   * @name Stats
   * @summary Get GoDoxy stats
   * @request GET:/stats
   * @response `200` `StatsResponse` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = StatsResponse;
  }
}

export namespace Version {
  /**
   * @description Get the version of the GoDoxy
   * @tags v1
   * @name Version
   * @summary Get version
   * @request GET:/version
   * @response `200` `string` version
   */
  export namespace Version {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export type ContentType =
  | "application/json"
  | "application/vnd.api+json"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded"
  | "text/plain";

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    ["application/json"]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    ["application/vnd.api+json"]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    ["text/plain"]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    ["multipart/form-data"]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    ["application/x-www-form-urlencoded"]: (input: any) =>
      this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || "application/json"];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== "multipart/form-data"
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title GoDoxy API
 * @version 1.0
 * @license MIT (https://github.com/yusing/godoxy/blob/main/LICENSE)
 * @termsOfService https://github.com/yusing/godoxy/blob/main/LICENSE
 * @baseUrl /api/v1
 * @externalDocs https://docs.godoxy.dev
 * @contact Yusing (https://github.com/yusing/godoxy/issues)
 *
 * GoDoxy API
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  agent = {
    /**
     * @description Create a new agent and return the docker compose file, encrypted CA and client PEMs The returned PEMs are encrypted with a random key and will be used for verification when adding a new agent
     *
     * @tags agent
     * @name Create
     * @summary Create a new agent
     * @request POST:/agent/create
     * @response `200` `NewAgentResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `409` `ErrorResponse` Conflict
     * @response `500` `ErrorResponse` Internal Server Error
     */
    create: (request: NewAgentRequest, params: RequestParams = {}) =>
      this.request<NewAgentResponse, ErrorResponse>({
        path: `/agent/create`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description List agents
     *
     * @tags agent, websocket
     * @name List
     * @summary List agents
     * @request GET:/agent/list
     * @response `200` `(Agent)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     */
    list: (params: RequestParams = {}) =>
      this.request<Agent[], ErrorResponse>({
        path: `/agent/list`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Verify a new agent and return the number of routes added
     *
     * @tags agent
     * @name Verify
     * @summary Verify a new agent
     * @request POST:/agent/verify
     * @response `200` `VerifyNewAgentResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    verify: (request: VerifyNewAgentRequest, params: RequestParams = {}) =>
      this.request<VerifyNewAgentResponse, ErrorResponse>({
        path: `/agent/verify`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * @description Handles the callback from the provider after successful authentication
     *
     * @tags auth
     * @name Callback
     * @summary Auth Callback
     * @request POST:/auth/callback
     * @response `200` `string` Userpass: OK
     * @response `302` `string` OIDC: Redirects to home page
     * @response `400` `string` Userpass: invalid request / credentials
     * @response `500` `string` Internal server error
     */
    callback: (
      body: AuthUserPassAuthCallbackRequest,
      params: RequestParams = {},
    ) =>
      this.request<string, string>({
        path: `/auth/callback`,
        method: "POST",
        body: body,
        type: "application/json",
        ...params,
      }),

    /**
     * @description Checks if the user is authenticated by validating their token
     *
     * @tags auth
     * @name Check
     * @summary Check authentication status
     * @request HEAD:/auth/check
     * @response `200` `string` OK
     * @response `302` `string` Redirects to login page or IdP
     */
    check: (params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/auth/check`,
        method: "HEAD",
        ...params,
      }),

    /**
     * @description Initiates the login process by redirecting the user to the provider's login page
     *
     * @tags auth
     * @name Login
     * @summary Login
     * @request POST:/auth/login
     * @response `302` `string` Redirects to login page or IdP
     * @response `429` `string` Too Many Requests
     */
    login: (params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/auth/login`,
        method: "POST",
        ...params,
      }),

    /**
     * @description Logs out the user by invalidating the token
     *
     * @tags auth
     * @name Logout
     * @summary Logout
     * @request POST:/auth/logout
     * @response `302` `string` Redirects to home page
     */
    logout: (params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/auth/logout`,
        method: "POST",
        ...params,
      }),
  };
  cert = {
    /**
     * @description Get cert info
     *
     * @tags cert
     * @name Info
     * @summary Get cert info
     * @request GET:/cert/info
     * @response `200` `(CertInfo)[]` OK
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` No certificates found or autocert is not enabled
     * @response `500` `ErrorResponse` Internal server error
     */
    info: (params: RequestParams = {}) =>
      this.request<CertInfo[], ErrorResponse>({
        path: `/cert/info`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Renew cert
     *
     * @tags cert, websocket
     * @name Renew
     * @summary Renew cert
     * @request GET:/cert/renew
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    renew: (params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/cert/renew`,
        method: "GET",
        ...params,
      }),
  };
  docker = {
    /**
     * @description Get container by container id
     *
     * @tags docker
     * @name Container
     * @summary Get container
     * @request GET:/docker/container/{id}
     * @response `200` `ContainerResponse` OK
     * @response `400` `ErrorResponse` ID is required
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    container: (id: string, params: RequestParams = {}) =>
      this.request<ContainerResponse, ErrorResponse>({
        path: `/docker/container/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get containers
     *
     * @tags docker
     * @name Containers
     * @summary Get containers
     * @request GET:/docker/containers
     * @response `200` `(ContainerResponse)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    containers: (params: RequestParams = {}) =>
      this.request<ContainerResponse[], ErrorResponse>({
        path: `/docker/containers`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get docker info
     *
     * @tags docker
     * @name Info
     * @summary Get docker info
     * @request GET:/docker/info
     * @response `200` `ServerInfo` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    info: (params: RequestParams = {}) =>
      this.request<ServerInfo, ErrorResponse>({
        path: `/docker/info`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get docker container logs by container id
     *
     * @tags docker, websocket
     * @name Logs
     * @summary Get docker container logs
     * @request GET:/docker/logs/{id}
     * @response `200` `void` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` server not found or container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    logs: (
      id: string,
      query?: {
        /** from timestamp */
        from?: string;
        /** levels */
        levels?: string;
        /** limit */
        limit?: number;
        /** show stderr */
        stderr?: boolean;
        /** show stdout */
        stdout?: boolean;
        /** to timestamp */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorResponse>({
        path: `/docker/logs/${id}`,
        method: "GET",
        query: query,
        type: "application/json",
        ...params,
      }),

    /**
     * @description Restart container by container id
     *
     * @tags docker
     * @name Restart
     * @summary Restart container
     * @request POST:/docker/restart
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    restart: (request: DockerapiRestartRequest, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/docker/restart`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Start container by container id
     *
     * @tags docker
     * @name Start
     * @summary Start container
     * @request POST:/docker/start
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    start: (request: DockerapiStartRequest, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/docker/start`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Get container stats by container id
     *
     * @tags docker, websocket
     * @name StatsDetail
     * @summary Get container stats
     * @request GET:/docker/stats/{id}
     * @response `200` `ContainerStatsResponse` OK
     * @response `400` `ErrorResponse` Invalid request: id is required or route is not a docker container
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    statsDetail: (id: string, params: RequestParams = {}) =>
      this.request<ContainerStatsResponse, ErrorResponse>({
        path: `/docker/stats/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Stop container by container id
     *
     * @tags docker
     * @name Stop
     * @summary Stop container
     * @request POST:/docker/stop
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Container not found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    stop: (request: DockerapiStopRequest, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/docker/stop`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  events = {
    /**
     * No description
     *
     * @tags v1
     * @name Events
     * @summary Get events history
     * @request GET:/events
     * @response `200` `(Event)[]` OK
     * @response `403` `ErrorResponse` Forbidden: unauthorized
     * @response `500` `ErrorResponse` Internal Server Error: internal error
     */
    events: (params: RequestParams = {}) =>
      this.request<Event[], ErrorResponse>({
        path: `/events`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  favicon = {
    /**
     * @description Get favicon
     *
     * @tags v1
     * @name Favicon
     * @summary Get favicon
     * @request GET:/favicon
     * @response `200` `(IconFetchResult)[]` OK
     * @response `400` `ErrorResponse` Bad Request: alias is empty or route is not HTTPRoute
     * @response `403` `ErrorResponse` Forbidden: unauthorized
     * @response `404` `ErrorResponse` Not Found: route or icon not found
     * @response `500` `ErrorResponse` Internal Server Error: internal error
     */
    favicon: (
      query?: {
        /** Alias of the route */
        alias?: string;
        /** URL of the route */
        url?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<IconFetchResult[], ErrorResponse>({
        path: `/favicon`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "blob",
        ...params,
      }),
  };
  file = {
    /**
     * @description Get file content
     *
     * @tags file
     * @name Get
     * @summary Get file content
     * @request GET:/file/content
     * @response `200` `string` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    get: (
      query: {
        /** @format filename */
        filename: string;
        type: "config" | "provider" | "middleware";
      },
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/file/content`,
        method: "GET",
        query: query,
        type: "application/json",
        ...params,
      }),

    /**
     * @description Set file content
     *
     * @tags file
     * @name Set
     * @summary Set file content
     * @request PUT:/file/content
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    set: (
      query: {
        /** Filename */
        filename: string;
        /** Type */
        type: "config" | "provider" | "middleware";
      },
      file: string,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/file/content`,
        method: "PUT",
        query: query,
        body: file,
        type: "text/plain",
        format: "json",
        ...params,
      }),

    /**
     * @description List files
     *
     * @tags file
     * @name List
     * @summary List files
     * @request GET:/file/list
     * @response `200` `ListFilesResponse` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    list: (params: RequestParams = {}) =>
      this.request<ListFilesResponse, ErrorResponse>({
        path: `/file/list`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Validate file
     *
     * @tags file
     * @name Validate
     * @summary Validate file
     * @request POST:/file/validate
     * @response `200` `SuccessResponse` File validated
     * @response `400` `ErrorResponse` Bad request
     * @response `403` `ErrorResponse` Forbidden
     * @response `417` `any` Validation failed
     * @response `500` `ErrorResponse` Internal server error
     */
    validate: (
      query: {
        /** Type */
        type: "config" | "provider" | "middleware";
      },
      file: string,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/file/validate`,
        method: "POST",
        query: query,
        body: file,
        format: "json",
        ...params,
      }),
  };
  health = {
    /**
     * @description Get health info by route name
     *
     * @tags v1, websocket
     * @name Health
     * @summary Get routes health info
     * @request GET:/health
     * @response `200` `HealthMap` Health info by route name
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    health: (params: RequestParams = {}) =>
      this.request<HealthMap, ErrorResponse>({
        path: `/health`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  homepage = {
    /**
     * @description List homepage categories
     *
     * @tags homepage
     * @name Categories
     * @summary List homepage categories
     * @request GET:/homepage/categories
     * @response `200` `(string)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    categories: (params: RequestParams = {}) =>
      this.request<string[], ErrorResponse>({
        path: `/homepage/categories`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Increment item click.
     *
     * @tags homepage
     * @name ItemClick
     * @summary Increment item click
     * @request POST:/homepage/item_click
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    itemClick: (
      query: {
        which: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/item_click`,
        method: "POST",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Homepage items
     *
     * @tags homepage, websocket
     * @name Items
     * @summary Homepage items
     * @request GET:/homepage/items
     * @response `200` `(HomepageCategory)[]` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    items: (
      query?: {
        /** Category filter */
        category?: string;
        /** Provider filter */
        provider?: string;
        /** Search query */
        search?: string;
        /**
         * Sort method
         * @default "alphabetical"
         */
        sort_method?: "clicks" | "alphabetical" | "custom";
      },
      params: RequestParams = {},
    ) =>
      this.request<HomepageCategory[], ErrorResponse>({
        path: `/homepage/items`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Set homepage category order.
     *
     * @tags homepage
     * @name SetCategoryOrder
     * @summary Set homepage category order
     * @request POST:/homepage/set/category_order
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setCategoryOrder: (
      request: HomepageOverrideCategoryOrderParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/category_order`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Override single homepage item.
     *
     * @tags homepage
     * @name SetItem
     * @summary Override single homepage item
     * @request POST:/homepage/set/item
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItem: (
      request: HomepageOverrideItemParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Set homepage item all sort order.
     *
     * @tags homepage
     * @name SetItemAllSortOrder
     * @summary Set homepage item all sort order
     * @request POST:/homepage/set/item_all_sort_order
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemAllSortOrder: (
      request: HomepageOverrideItemAllSortOrderParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_all_sort_order`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Set homepage item fav sort order.
     *
     * @tags homepage
     * @name SetItemFavSortOrder
     * @summary Set homepage item fav sort order
     * @request POST:/homepage/set/item_fav_sort_order
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemFavSortOrder: (
      request: HomepageOverrideItemFavSortOrderParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_fav_sort_order`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Set homepage item favorite.
     *
     * @tags homepage
     * @name SetItemFavorite
     * @summary Set homepage item favorite
     * @request POST:/homepage/set/item_favorite
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemFavorite: (
      request: HomepageOverrideItemFavoriteParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_favorite`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Set homepage item sort order.
     *
     * @tags homepage
     * @name SetItemSortOrder
     * @summary Set homepage item sort order
     * @request POST:/homepage/set/item_sort_order
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemSortOrder: (
      request: HomepageOverrideItemSortOrderParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_sort_order`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description POST list of item ids and visibility value.
     *
     * @tags homepage
     * @name SetItemVisible
     * @summary Set homepage item visibility
     * @request POST:/homepage/set/item_visible
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemVisible: (
      request: HomepageOverrideItemVisibleParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_visible`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Override multiple homepage items.
     *
     * @tags homepage
     * @name SetItemsBatch
     * @summary Override multiple homepage items
     * @request POST:/homepage/set/items_batch
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `500` `ErrorResponse` Internal Server Error
     */
    setItemsBatch: (
      request: HomepageOverrideItemsBatchParams,
      params: RequestParams = {},
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/items_batch`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  icons = {
    /**
     * @description List icons
     *
     * @tags v1
     * @name Icons
     * @summary List icons
     * @request GET:/icons
     * @response `200` `(IconMetaSearch)[]` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     */
    icons: (
      query?: {
        /** Keyword */
        keyword?: string;
        /** Limit */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<IconMetaSearch[], ErrorResponse>({
        path: `/icons`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  metrics = {
    /**
     * @description Get system info
     *
     * @tags metrics, websocket
     * @name AllSystemInfo
     * @summary Get system info
     * @request GET:/metrics/all_system_info
     * @response `200` `Record<string,SystemInfoAggregate>` period specified, aggregated system info by agent name
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    allSystemInfo: (
      query?: {
        aggregate?:
          | "cpu_average"
          | "memory_usage"
          | "memory_usage_percent"
          | "disks_read_speed"
          | "disks_write_speed"
          | "disks_iops"
          | "disk_usage"
          | "network_speed"
          | "network_transfer"
          | "sensor_temperature";
        /** @format duration */
        interval?: string;
        period?: "5m" | "15m" | "1h" | "1d" | "1mo";
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, SystemInfoAggregate>, ErrorResponse>({
        path: `/metrics/all_system_info`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get system info
     *
     * @tags metrics, websocket
     * @name SystemInfo
     * @summary Get system info
     * @request GET:/metrics/system_info
     * @response `200` `SystemInfoAggregate` period specified
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Not Found
     * @response `500` `ErrorResponse` Internal Server Error
     */
    systemInfo: (
      query?: {
        agentAddr?: string;
        agentName?: string;
        aggregate?:
          | "cpu_average"
          | "memory_usage"
          | "memory_usage_percent"
          | "disks_read_speed"
          | "disks_write_speed"
          | "disks_iops"
          | "disk_usage"
          | "network_speed"
          | "network_transfer"
          | "sensor_temperature";
        period?: "5m" | "15m" | "1h" | "1d" | "1mo";
      },
      params: RequestParams = {},
    ) =>
      this.request<SystemInfoAggregate, ErrorResponse>({
        path: `/metrics/system_info`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get uptime
     *
     * @tags metrics, websocket
     * @name Uptime
     * @summary Get uptime
     * @request GET:/metrics/uptime
     * @response `200` `UptimeAggregate` period specified
     * @response `204` `ErrorResponse` No Content
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    uptime: (
      query?: {
        /** @example "1m" */
        interval?: "5m" | "15m" | "1h" | "1d" | "1mo";
        /** @example "" */
        keyword?: string;
        /**
         * @default 0
         * @example 10
         */
        limit?: number;
        /**
         * @default 0
         * @example 10
         */
        offset?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<UptimeAggregate, ErrorResponse>({
        path: `/metrics/uptime`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  proxmox = {
    /**
     * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
     *
     * @tags proxmox, websocket
     * @name Journalctl
     * @summary Get journalctl output
     * @request GET:/proxmox/journalctl
     * @response `200` `string` Journalctl output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    journalctl: (
      query: {
        /**
         * Limit output lines (1-1000)
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /** Node name */
        node: string;
        /** Service names */
        service?: string[];
        /** Container VMID (optional - if not provided, streams node journalctl) */
        vmid?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/journalctl`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
     *
     * @tags proxmox, websocket
     * @name Journalctl2
     * @summary Get journalctl output
     * @request GET:/proxmox/journalctl/{node}
     * @originalName journalctl
     * @duplicate
     * @response `200` `string` Journalctl output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    journalctl2: (
      node: string,
      query: {
        /**
         * Limit output lines (1-1000)
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /** Node name */
        node: string;
        /** Service names */
        service?: string[];
        /** Container VMID (optional - if not provided, streams node journalctl) */
        vmid?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/journalctl/${node}`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
     *
     * @tags proxmox, websocket
     * @name Journalctl3
     * @summary Get journalctl output
     * @request GET:/proxmox/journalctl/{node}/{vmid}
     * @originalName journalctl
     * @duplicate
     * @response `200` `string` Journalctl output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    journalctl3: (
      node: string,
      query: {
        /**
         * Limit output lines (1-1000)
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /** Node name */
        node: string;
        /** Service names */
        service?: string[];
        /** Container VMID (optional - if not provided, streams node journalctl) */
        vmid?: number;
      },
      vmid?: number,
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/journalctl/${node}/${vmid}`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Get journalctl output for node or LXC container. If vmid is not provided, streams node journalctl.
     *
     * @tags proxmox, websocket
     * @name Journalctl4
     * @summary Get journalctl output
     * @request GET:/proxmox/journalctl/{node}/{vmid}/{service}
     * @originalName journalctl
     * @duplicate
     * @response `200` `string` Journalctl output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    journalctl4: (
      node: string,
      query: {
        /**
         * Limit output lines (1-1000)
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /** Node name */
        node: string;
        /** Service names */
        service?: string[];
        /** Container VMID (optional - if not provided, streams node journalctl) */
        vmid?: number;
      },
      service?: string[],
      vmid?: number,
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/journalctl/${node}/${vmid}/${service}`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Restart LXC container by node and vmid
     *
     * @tags proxmox
     * @name LxcRestart
     * @summary Restart LXC container
     * @request POST:/proxmox/lxc/:node/:vmid/restart
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal Server Error
     */
    lxcRestart: (node: string, vmid: number, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/proxmox/lxc/${node}/${vmid}/restart`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Start LXC container by node and vmid
     *
     * @tags proxmox
     * @name LxcStart
     * @summary Start LXC container
     * @request POST:/proxmox/lxc/:node/:vmid/start
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal Server Error
     */
    lxcStart: (node: string, vmid: number, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/proxmox/lxc/${node}/${vmid}/start`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Stop LXC container by node and vmid
     *
     * @tags proxmox
     * @name LxcStop
     * @summary Stop LXC container
     * @request POST:/proxmox/lxc/:node/:vmid/stop
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Invalid request
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal Server Error
     */
    lxcStop: (node: string, vmid: number, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/proxmox/lxc/${node}/${vmid}/stop`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Get proxmox node stats in json
     *
     * @tags proxmox, websocket
     * @name NodeStats
     * @summary Get proxmox node stats
     * @request GET:/proxmox/stats/{node}
     * @response `200` `ProxmoxNodeStats` Stats output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    nodeStats: (node: string, params: RequestParams = {}) =>
      this.request<ProxmoxNodeStats, ErrorResponse>({
        path: `/proxmox/stats/${node}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get proxmox VM stats in format of "STATUS|CPU%%|MEM USAGE/LIMIT|MEM%%|NET I/O|BLOCK I/O"
     *
     * @tags proxmox, websocket
     * @name VmStats
     * @summary Get proxmox VM stats
     * @request GET:/proxmox/stats/{node}/{vmid}
     * @response `200` `string` Stats output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    vmStats: (node: string, vmid: number, params: RequestParams = {}) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/stats/${node}/${vmid}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get tail output for node or LXC container. If vmid is not provided, streams node tail.
     *
     * @tags proxmox, websocket
     * @name Tail
     * @summary Get tail output
     * @request GET:/proxmox/tail
     * @response `200` `string` Tail output
     * @response `400` `ErrorResponse` Invalid request
     * @response `403` `ErrorResponse` Unauthorized
     * @response `404` `ErrorResponse` Node not found
     * @response `409` `ErrorResponse` Node name is ambiguous
     * @response `500` `ErrorResponse` Internal server error
     */
    tail: (
      query: {
        /** File paths */
        file: string[];
        /**
         * Limit output lines (1-1000)
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /** Node name */
        node: string;
        /** Container VMID (optional - if not provided, streams node journalctl) */
        vmid?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<string, ErrorResponse>({
        path: `/proxmox/tail`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  route = {
    /**
     * @description List routes by provider
     *
     * @tags route
     * @name ByProvider
     * @summary List routes by provider
     * @request GET:/route/by_provider
     * @response `200` `RouteApiRoutesByProvider` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    byProvider: (params: RequestParams = {}) =>
      this.request<RouteApiRoutesByProvider, ErrorResponse>({
        path: `/route/by_provider`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description List routes
     *
     * @tags route, websocket
     * @name List
     * @summary List routes
     * @request GET:/route/list
     * @response `200` `(Route)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     */
    list: (
      query?: {
        /** Provider */
        provider?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Route[], ErrorResponse>({
        path: `/route/list`,
        method: "GET",
        query: query,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Test rules against mock request/response
     *
     * @tags route
     * @name Playground
     * @summary Rule Playground
     * @request POST:/route/playground
     * @response `200` `PlaygroundResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     */
    playground: (request: PlaygroundRequest, params: RequestParams = {}) =>
      this.request<PlaygroundResponse, ErrorResponse>({
        path: `/route/playground`,
        method: "POST",
        body: request,
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description List route providers
     *
     * @tags route, websocket
     * @name Providers
     * @summary List route providers
     * @request GET:/route/providers
     * @response `200` `(RouteProvider)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    providers: (params: RequestParams = {}) =>
      this.request<RouteProvider[], ErrorResponse>({
        path: `/route/providers`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),

    /**
     * @description Validate route,
     *
     * @tags route, websocket
     * @name Validate
     * @summary Validate route
     * @request GET:/route/validate
     * @response `200` `SuccessResponse` Route validated
     * @response `400` `ErrorResponse` Bad request
     * @response `403` `ErrorResponse` Forbidden
     * @response `417` `any` Validation failed
     * @response `500` `ErrorResponse` Internal server error
     */
    validate: (route: Route, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/route/validate`,
        method: "GET",
        body: route,
        format: "json",
        ...params,
      }),

    /**
     * @description Validate route,
     *
     * @tags route, websocket
     * @name Validate2
     * @summary Validate route
     * @request POST:/route/validate
     * @originalName validate
     * @duplicate
     * @response `200` `SuccessResponse` Route validated
     * @response `400` `ErrorResponse` Bad request
     * @response `403` `ErrorResponse` Forbidden
     * @response `417` `any` Validation failed
     * @response `500` `ErrorResponse` Internal server error
     */
    validate2: (route: Route, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/route/validate`,
        method: "POST",
        body: route,
        format: "json",
        ...params,
      }),

    /**
     * @description List route
     *
     * @tags route
     * @name Route
     * @summary List route
     * @request GET:/route/{which}
     * @response `200` `Route` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `404` `ErrorResponse` Not Found
     */
    route: (which: string, params: RequestParams = {}) =>
      this.request<Route, ErrorResponse>({
        path: `/route/${which}`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  stats = {
    /**
     * @description Get stats
     *
     * @tags v1, websocket
     * @name Stats
     * @summary Get GoDoxy stats
     * @request GET:/stats
     * @response `200` `StatsResponse` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    stats: (params: RequestParams = {}) =>
      this.request<StatsResponse, ErrorResponse>({
        path: `/stats`,
        method: "GET",
        type: "application/json",
        format: "json",
        ...params,
      }),
  };
  version = {
    /**
     * @description Get the version of the GoDoxy
     *
     * @tags v1
     * @name Version
     * @summary Get version
     * @request GET:/version
     * @response `200` `string` version
     */
    version: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/version`,
        method: "GET",
        type: "application/json",
        ...params,
      }),
  };
}
