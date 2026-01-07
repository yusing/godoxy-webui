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
  config: Record<string, AccesslogFieldMode>
  default: 'keep' | 'drop' | 'redact'
}

export type AccesslogFieldMode = 'keep' | 'drop' | 'redact'

export interface AccesslogFields {
  cookies: AccesslogFieldConfig
  headers: AccesslogFieldConfig
  query: AccesslogFieldConfig
}

export interface AccesslogFilters {
  cidr: LogFilterCIDR
  /** header exists or header == value */
  headers: LogFilterHTTPHeader
  host: LogFilterHost
  method: LogFilterHTTPMethod
  status_codes: LogFilterStatusCodeRange
}

export interface Agent {
  addr: string
  name: string
  runtime: AgentContainerRuntime
  stream_port: number
  version: string
}

export type AgentContainerRuntime = 'docker' | 'podman'

export interface AuthUserPassAuthCallbackRequest {
  password: string
  username: string
}

export interface CIDR {
  /** network number */
  ip: number[]
  /** network mask */
  mask: number[]
}

export interface CertInfo {
  dns_names: string[]
  email_addresses: string[]
  issuer: string
  not_after: number
  not_before: number
  subject: string
}

export interface Container {
  agent: Agent
  aliases: string[]
  container_id: string
  container_name: string
  docker_cfg: DockerProviderConfig
  errors: string
  idlewatcher_config: IdlewatcherConfig
  image: ContainerImage
  is_excluded: boolean
  is_explicit: boolean
  is_host_network_mode: boolean
  /** for displaying in UI */
  labels: Record<string, string>
  /** source:destination */
  mounts: Record<string, string>
  network: string
  private_hostname: string
  /** privatePort:types.Port */
  private_ports: TypesPortMapping
  public_hostname: string
  /** non-zero publicPort:types.Port */
  public_ports: TypesPortMapping
  running: boolean
  state: ContainerContainerState
}

export type ContainerContainerState =
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead'

export interface ContainerImage {
  sha256: string
  author: string
  name: string
  tag: string
  version: string
}

export interface ContainerPortSummary {
  /** Host IP address that the container's port is mapped to */
  IP: NetipAddr
  /**
   * Port on the container
   * Required: true
   */
  PrivatePort: number
  /** Port exposed on the host */
  PublicPort: number
  /**
   * type
   * Required: true
   * Enum: ["tcp","udp","sctp"]
   */
  Type: string
}

export interface ContainerResponse {
  id: string
  image: string
  name: string
  server: string
  state?: ContainerState | null
}

export type ContainerState =
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead'

export interface ContainerStats {
  paused: number
  running: number
  stopped: number
  total: number
}

export type ContainerStopMethod = 'pause' | 'stop' | 'kill'

export interface DiskIOCountersStat {
  iops: number
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
  name: string
  /**
   * SerialNumber     string `json:"serialNumber"`
   * Label            string `json:"label"`
   */
  read_bytes: number
  read_count: number
  read_speed: number
  write_bytes: number
  write_count: number
  write_speed: number
}

export interface DiskUsageStat {
  free: number
  fstype: string
  path: string
  total: number
  used: number
  used_percent: number
}

export interface DockerConfig {
  container_id: string
  container_name: string
  docker_cfg: DockerProviderConfig
}

export interface DockerProviderConfig {
  tls: DockerTLSConfig
  url: string
}

export interface DockerTLSConfig {
  ca_file: string
  cert_file?: string
  key_file?: string
}

export interface DockerapiRestartRequest {
  id: string
  /**
   * Signal (optional) is the signal to send to the container to (gracefully)
   * stop it before forcibly terminating the container with SIGKILL after the
   * timeout expires. If no value is set, the default (SIGTERM) is used.
   */
  signal?: string
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
  timeout?: number
}

export interface DockerapiStartRequest {
  checkpointDir?: string
  checkpointID?: string
  id: string
}

export interface DockerapiStopRequest {
  id: string
  /**
   * Signal (optional) is the signal to send to the container to (gracefully)
   * stop it before forcibly terminating the container with SIGKILL after the
   * timeout expires. If no value is set, the default (SIGTERM) is used.
   */
  signal?: string
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
  timeout?: number
}

export interface ErrorResponse {
  error?: string | null
  message: string
}

export type FileType = 'config' | 'provider' | 'middleware'

export interface FinalRequest {
  body: string
  headers: Record<string, string[]>
  host: string
  method: string
  path: string
  query: Record<string, string[]>
}

export interface FinalResponse {
  body: string
  headers: Record<string, string[]>
  statusCode: number
}

export interface HTTPHeader {
  key: string
  value: string
}

export interface HealthCheckConfig {
  disable: boolean
  interval: number
  path: string
  /** <0: immediate, 0: default, >0: threshold */
  retries: number
  timeout: number
  use_get: boolean
}

export interface HealthExtra {
  config: LoadBalancerConfig
  pool: Record<string, any>
}

export interface HealthInfoWithoutDetail {
  /** latency in microseconds */
  latency: number
  status: 'healthy' | 'unhealthy' | 'napping' | 'starting' | 'error' | 'unknown'
  /** uptime in milliseconds */
  uptime: number
}

export interface HealthJSON {
  config: HealthCheckConfig
  detail: string
  extra?: HealthExtra | null
  /** unix timestamp in seconds */
  lastSeen: number
  /** latency in milliseconds */
  latency: number
  name: string
  /** unix timestamp in seconds */
  started: number
  status: HealthStatusString
  /** uptime in seconds */
  uptime: number
  url: string
}

export type HealthMap = Record<string, HealthStatusString>

export type HealthStatusString =
  | 'unknown'
  | 'healthy'
  | 'napping'
  | 'starting'
  | 'unhealthy'
  | 'error'

export interface HomepageCategory {
  items: HomepageItem[]
  name: string
}

export interface HomepageFetchResult {
  icon: number[]
  statusCode: number
}

export interface HomepageIconMetaSearch {
  Dark: boolean
  Light: boolean
  PNG: boolean
  Ref: string
  SVG: boolean
  Source: HomepageIconSource
  WebP: boolean
}

export type HomepageIconSource = 'https://' | '@target' | '@walkxcode' | '@selfhst'

export interface HomepageItem {
  alias: string
  /** sort order in all */
  all_sort_order: number
  category: string
  clicks: number
  container_id?: string | null
  description: string
  /** sort order in favorite */
  fav_sort_order: number
  favorite: boolean
  icon: string
  /** display name */
  name: string
  origin_url: string
  provider: string
  show: boolean
  /** sort order in category */
  sort_order: number
  url: string
  widget_config?: WidgetsConfig | null
  widgets: HomepageItemWidget[]
}

export interface HomepageItemConfig {
  category: string
  description: string
  favorite: boolean
  icon: string
  /** display name */
  name: string
  show: boolean
  url: string
  widget_config?: WidgetsConfig | null
}

export interface HomepageItemWidget {
  label: string
  value: string
}

export interface HomepageOverrideCategoryOrderParams {
  value: number
  which: string
}

export interface HomepageOverrideItemAllSortOrderParams {
  value: number
  which: string
}

export interface HomepageOverrideItemFavSortOrderParams {
  value: number
  which: string
}

export interface HomepageOverrideItemFavoriteParams {
  value: boolean
  which: string[]
}

export interface HomepageOverrideItemParams {
  value: HomepageItemConfig
  which: string
}

export interface HomepageOverrideItemSortOrderParams {
  value: number
  which: string
}

export interface HomepageOverrideItemVisibleParams {
  value: boolean
  which: string[]
}

export interface HomepageOverrideItemsBatchParams {
  value: Record<string, HomepageItemConfig>
}

export interface IdlewatcherConfig {
  depends_on: string[]
  docker: DockerConfig
  /**
   * 0: no idle watcher.
   * Positive: idle watcher with idle timeout.
   * Negative: idle watcher as a dependency.	IdleTimeout time.Duration `json:"idle_timeout" json_ext:"duration"`
   */
  idle_timeout: TimeDuration
  no_loading_page: boolean
  proxmox: ProxmoxConfig
  /** Optional path that must be hit to start container */
  start_endpoint: string
  stop_method: ContainerStopMethod
  stop_signal: string
  stop_timeout: TimeDuration
  wake_timeout: TimeDuration
}

export interface ListFilesResponse {
  config: string[]
  middleware: string[]
  provider: string[]
}

export interface LoadBalancerConfig {
  link: string
  mode: LoadBalancerMode
  options: Record<string, any>
  sticky: boolean
  sticky_max_age: TimeDuration
  weight: number
}

export type LoadBalancerMode = '' | 'roundrobin' | 'leastconn' | 'iphash'

export interface LogFilterCIDR {
  negative: boolean
  values: CIDR[]
}

export interface LogFilterHTTPHeader {
  negative: boolean
  values: HTTPHeader[]
}

export interface LogFilterHTTPMethod {
  negative: boolean
  values: string[]
}

export interface LogFilterHost {
  negative: boolean
  values: string[]
}

export interface LogFilterStatusCodeRange {
  negative: boolean
  values: StatusCodeRange[]
}

export interface LogRetention {
  days: number
  keep_size: number
  last: number
}

export interface MemVirtualMemoryStat {
  /**
   * RAM available for programs to allocate
   *
   * This value is computed from the kernel specific values.
   */
  available: number
  /** Total amount of RAM on this system */
  total: number
  /**
   * RAM used by programs
   *
   * This value is computed from the kernel specific values.
   */
  used: number
  /**
   * Percentage of RAM used by programs
   *
   * This value is computed from the kernel specific values.
   */
  used_percent: number
}

export type MetricsPeriod = '5m' | '15m' | '1h' | '1d' | '1mo'

export interface MockCookie {
  name: string
  value: string
}

export interface MockRequest {
  body: string
  cookies: MockCookie[]
  headers: Record<string, string[]>
  host: string
  method: string
  path: string
  query: Record<string, string[]>
  remoteIP: string
}

export interface MockResponse {
  body: string
  headers: Record<string, string[]>
  statusCode: number
}

export interface NetIOCountersStat {
  /** number of bytes received */
  bytes_recv: number
  /** Name      string `json:"name"`       // interface name */
  bytes_sent: number
  /** godoxy */
  download_speed: number
  /** godoxy */
  upload_speed: number
}

export type NetipAddr = string

export interface NewAgentRequest {
  /** @default "docker" */
  container_runtime?: 'docker' | 'podman'
  host: string
  name: string
  nightly?: boolean
  /**
   * @min 1
   * @max 65535
   */
  port: number
  /**
   * @min 1
   * @max 65535
   */
  stream_port?: number
  type: 'docker' | 'system'
}

export interface NewAgentResponse {
  ca: PEMPairResponse
  client: PEMPairResponse
  compose: string
}

export interface PEMPairResponse {
  /** @format base64 */
  cert: string
  /** @format base64 */
  key: string
}

export interface ParsedRule {
  do: string
  isResponseRule: boolean
  name: string
  on: string
  validationError: any
}

export interface PlaygroundRequest {
  mockRequest?: MockRequest
  mockResponse?: MockResponse
  rules: RouteApiRawRule[]
}

export interface PlaygroundResponse {
  executionError: any
  finalRequest: FinalRequest
  finalResponse: FinalResponse
  matchedRules: string[]
  parsedRules: ParsedRule[]
  upstreamCalled: boolean
}

export interface Port {
  listening: number
  proxy: number
}

export interface ProviderStats {
  reverse_proxies: RouteStats
  streams: RouteStats
  total: number
  type: ProviderType
}

export type ProviderType = 'docker' | 'file' | 'agent'

export interface ProxmoxConfig {
  node: string
  vmid: number
}

export interface ProxyStats {
  providers: Record<string, ProviderStats>
  reverse_proxies: RouteStats
  streams: RouteStats
  total: number
}

export interface RequestLoggerConfig {
  /** Deprecated: buffer size is adjusted dynamically */
  buffer_size: number
  fields: AccesslogFields
  filters: AccesslogFilters
  format: 'common' | 'combined' | 'json'
  path: string
  retention: LogRetention
  rotate_interval: number
  stdout: boolean
}

export interface Route {
  access_log?: RequestLoggerConfig | null
  agent: string
  alias: string
  /** Docker only */
  container?: Container | null
  disable_compression: boolean
  excluded?: boolean | null
  excluded_reason?: string | null
  /** for swagger */
  health: HealthJSON
  /** null on load-balancer routes */
  healthcheck?: HealthCheckConfig | null
  homepage: HomepageItemConfig
  host: string
  idlewatcher?: IdlewatcherConfig | null
  /** Index file to serve for single-page app mode */
  index: string
  load_balance?: LoadBalancerConfig | null
  /** private fields */
  lurl?: string | null
  middlewares?: Record<string, TypesLabelMap>
  no_tls_verify: boolean
  path_patterns?: string[] | null
  port: Port
  /** for backward compatibility */
  provider?: string | null
  purl: string
  response_header_timeout: number
  root: string
  rule_file?: string | null
  rules: RulesRule[]
  scheme: 'http' | 'https' | 'h2c' | 'tcp' | 'udp' | 'fileserver'
  /** Single-page app mode: serves index for non-existent paths */
  spa: boolean
  /** Path to client certificate */
  ssl_certificate: string
  /** Path to client certificate key */
  ssl_certificate_key: string
  /** Allowed TLS protocols */
  ssl_protocols: string[]
  /** SSL/TLS proxy options (nginx-like) */
  ssl_server_name: string
  /** Path to trusted CA certificates */
  ssl_trusted_certificate: string
}

export interface RouteApiRawRule {
  do: string
  name: string
  on: string
}

export type RouteApiRoutesByProvider = Record<string, RouteRoute[]>

export interface RouteProvider {
  full_name: string
  short_name: string
}

export interface RouteRoute {
  access_log?: RequestLoggerConfig | null
  agent: string
  alias: string
  /** Docker only */
  container?: Container | null
  disable_compression: boolean
  excluded?: boolean | null
  excluded_reason?: string | null
  /** for swagger */
  health: HealthJSON
  /** null on load-balancer routes */
  healthcheck?: HealthCheckConfig | null
  homepage: HomepageItemConfig
  host: string
  idlewatcher?: IdlewatcherConfig | null
  /** Index file to serve for single-page app mode */
  index: string
  load_balance?: LoadBalancerConfig | null
  /** private fields */
  lurl?: string | null
  middlewares?: Record<string, TypesLabelMap>
  no_tls_verify: boolean
  path_patterns?: string[] | null
  port: Port
  /** for backward compatibility */
  provider?: string | null
  purl: string
  response_header_timeout: number
  root: string
  rule_file?: string | null
  rules: RulesRule[]
  scheme: 'http' | 'https' | 'h2c' | 'tcp' | 'udp' | 'fileserver'
  /** Single-page app mode: serves index for non-existent paths */
  spa: boolean
  /** Path to client certificate */
  ssl_certificate: string
  /** Path to client certificate key */
  ssl_certificate_key: string
  /** Allowed TLS protocols */
  ssl_protocols: string[]
  /** SSL/TLS proxy options (nginx-like) */
  ssl_server_name: string
  /** Path to trusted CA certificates */
  ssl_trusted_certificate: string
}

export interface RouteStats {
  error: number
  healthy: number
  napping: number
  total: number
  unhealthy: number
  unknown: number
}

export interface RouteStatus {
  latency: number
  status: 'healthy' | 'unhealthy' | 'unknown' | 'napping' | 'starting'
  timestamp: number
}

export interface RouteStatusesByAlias {
  statuses: Record<string, HealthInfoWithoutDetail>
  timestamp: number
}

export interface RouteUptimeAggregate {
  alias: string
  avg_latency: number
  current_status: 'healthy' | 'unhealthy' | 'unknown' | 'napping' | 'starting'
  display_name: string
  downtime: number
  idle: number
  is_docker: boolean
  is_excluded: boolean
  statuses: RouteStatus[]
  uptime: number
}

export interface RulesRule {
  do: string
  name: string
  on: string
}

export interface SensorsTemperatureStat {
  critical: number
  high: number
  name: string
  temperature: number
}

export interface ServerInfo {
  containers: ContainerStats
  images: number
  memory: string
  n_cpu: number
  name: string
  version: string
}

export interface StatsResponse {
  proxies: ProxyStats
  uptime: number
}

export interface StatusCodeRange {
  end: number
  start: number
}

export interface SuccessResponse {
  details?: Record<string, any>
  message: string
}

export interface SystemInfo {
  cpu_average: number
  /** disk usage by partition */
  disks: Record<string, DiskUsageStat>
  /** disk IO by device */
  disks_io: Record<string, DiskIOCountersStat>
  memory: MemVirtualMemoryStat
  network: NetIOCountersStat
  /** sensor temperature by key */
  sensors: SensorsTemperatureStat[]
  timestamp: number
}

export interface SystemInfoAggregate {
  data: Record<string, any>[]
  total: number
}

export type SystemInfoAggregateMode =
  | 'cpu_average'
  | 'memory_usage'
  | 'memory_usage_percent'
  | 'disks_read_speed'
  | 'disks_write_speed'
  | 'disks_iops'
  | 'disk_usage'
  | 'network_speed'
  | 'network_transfer'
  | 'sensor_temperature'

/** @format int64 */
export type TimeDuration =
  | -9223372036854776000
  | 9223372036854776000
  | 1
  | 1000
  | 1000000
  | 1000000000
  | 60000000000
  | 3600000000000

export type TypesLabelMap = Record<string, any>

export type TypesPortMapping = Record<string, ContainerPortSummary>

export interface UptimeAggregate {
  data: RouteUptimeAggregate[]
  total: number
}

export interface VerifyNewAgentRequest {
  ca: PEMPairResponse
  client: PEMPairResponse
  container_runtime: AgentContainerRuntime
  host: string
}

export interface WidgetsConfig {
  config: any
  provider: string
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = NewAgentRequest
    export type RequestHeaders = {}
    export type ResponseBody = NewAgentResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = Agent[]
  }

  /**
   * @description Verify a new agent and return the number of routes added
   * @tags agent
   * @name Verify
   * @summary Verify a new agent
   * @request POST:/agent/verify
   * @response `200` `SuccessResponse` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Verify {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = VerifyNewAgentRequest
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = AuthUserPassAuthCallbackRequest
    export type RequestHeaders = {}
    export type ResponseBody = string
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = string
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = any
  }

  /**
   * @description Logs out the user by invalidating the token
   * @tags auth
   * @name Logout
   * @summary Logout
   * @request GET:/auth/logout
   * @response `302` `string` Redirects to home page
   */
  export namespace Logout {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = any
  }

  /**
   * @description Logs out the user by invalidating the token
   * @tags auth
   * @name Logout2
   * @summary Logout
   * @request POST:/auth/logout
   * @originalName logout
   * @duplicate
   * @response `302` `string` Redirects to home page
   */
  export namespace Logout2 {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = any
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = CertInfo[]
  }

  /**
   * @description Renew cert
   * @tags cert, websocket
   * @name Renew
   * @summary Renew cert
   * @request GET:/cert/renew
   * @response `200` `SuccessResponse` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Renew {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
      id: string
    }
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = ContainerResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = ContainerResponse[]
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = ServerInfo
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
      id: string
    }
    export type RequestQuery = {
      /** from timestamp */
      from?: string
      /** levels */
      levels?: string
      /** show stderr */
      stderr?: boolean
      /** show stdout */
      stdout?: boolean
      /** to timestamp */
      to?: string
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = void
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = DockerapiRestartRequest
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = DockerapiStartRequest
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = DockerapiStopRequest
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
  }
}

export namespace Favicon {
  /**
   * @description Get favicon
   * @tags v1
   * @name Favicon
   * @summary Get favicon
   * @request GET:/favicon
   * @response `200` `(HomepageFetchResult)[]` OK
   * @response `400` `ErrorResponse` Bad Request: alias is empty or route is not HTTPRoute
   * @response `403` `ErrorResponse` Forbidden: unauthorized
   * @response `404` `ErrorResponse` Not Found: route or icon not found
   * @response `500` `ErrorResponse` Internal Server Error: internal error
   */
  export namespace Favicon {
    export type RequestParams = {}
    export type RequestQuery = {
      /** Alias of the route */
      alias?: string
      /** URL of the route */
      url?: string
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = HomepageFetchResult[]
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
    export type RequestParams = {}
    export type RequestQuery = {
      /** @format filename */
      filename: string
      type: 'config' | 'provider' | 'middleware'
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = string
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
    export type RequestParams = {}
    export type RequestQuery = {
      /** Filename */
      filename: string
      /** Type */
      type: 'config' | 'provider' | 'middleware'
    }
    export type RequestBody = string
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = ListFilesResponse
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
    export type RequestParams = {}
    export type RequestQuery = {
      /** Type */
      type: 'config' | 'provider' | 'middleware'
    }
    export type RequestBody = string
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = HealthMap
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
   */
  export namespace Categories {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = string[]
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
    export type RequestParams = {}
    export type RequestQuery = {
      which: string
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
   */
  export namespace Items {
    export type RequestParams = {}
    export type RequestQuery = {
      /** Category filter */
      category?: string
      /** Provider filter */
      provider?: string
      /** Search query */
      search?: string
      /**
       * Sort method
       * @default "alphabetical"
       */
      sort_method?: 'clicks' | 'alphabetical' | 'custom'
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = HomepageCategory[]
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideCategoryOrderParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemAllSortOrderParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemFavSortOrderParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemFavoriteParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemSortOrderParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemVisibleParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = HomepageOverrideItemsBatchParams
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
  }
}

export namespace Icons {
  /**
   * @description List icons
   * @tags v1
   * @name Icons
   * @summary List icons
   * @request GET:/icons
   * @response `200` `(HomepageIconMetaSearch)[]` OK
   * @response `400` `ErrorResponse` Bad Request
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace Icons {
    export type RequestParams = {}
    export type RequestQuery = {
      /** Keyword */
      keyword?: string
      /** Limit */
      limit?: number
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = HomepageIconMetaSearch[]
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
    export type RequestParams = {}
    export type RequestQuery = {
      aggregate?:
        | 'cpu_average'
        | 'memory_usage'
        | 'memory_usage_percent'
        | 'disks_read_speed'
        | 'disks_write_speed'
        | 'disks_iops'
        | 'disk_usage'
        | 'network_speed'
        | 'network_transfer'
        | 'sensor_temperature'
      /** @format duration */
      interval?: string
      period?: '5m' | '15m' | '1h' | '1d' | '1mo'
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = Record<string, SystemInfoAggregate>
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
    export type RequestParams = {}
    export type RequestQuery = {
      agentAddr?: string
      agentName?: string
      aggregate?:
        | 'cpu_average'
        | 'memory_usage'
        | 'memory_usage_percent'
        | 'disks_read_speed'
        | 'disks_write_speed'
        | 'disks_iops'
        | 'disk_usage'
        | 'network_speed'
        | 'network_transfer'
        | 'sensor_temperature'
      period?: '5m' | '15m' | '1h' | '1d' | '1mo'
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = SystemInfoAggregate
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
    export type RequestParams = {}
    export type RequestQuery = {
      /** @example "1m" */
      interval?: '5m' | '15m' | '1h' | '1d' | '1mo'
      /** @example "" */
      keyword?: string
      /**
       * @default 0
       * @example 10
       */
      limit?: number
      /**
       * @default 0
       * @example 10
       */
      offset?: number
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = UptimeAggregate
  }
}

export namespace Reload {
  /**
   * @description Reload config
   * @tags v1
   * @name Reload
   * @summary Reload config
   * @request POST:/reload
   * @response `200` `SuccessResponse` OK
   * @response `403` `ErrorResponse` Forbidden
   * @response `500` `ErrorResponse` Internal Server Error
   */
  export namespace Reload {
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = SuccessResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = RouteApiRoutesByProvider
  }

  /**
   * @description List routes
   * @tags route, websocket
   * @name Routes
   * @summary List routes
   * @request GET:/route/list
   * @response `200` `(Route)[]` OK
   * @response `403` `ErrorResponse` Forbidden
   */
  export namespace Routes {
    export type RequestParams = {}
    export type RequestQuery = {
      /** Provider */
      provider?: string
    }
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = Route[]
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = PlaygroundRequest
    export type RequestHeaders = {}
    export type ResponseBody = PlaygroundResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = RouteProvider[]
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
      which: string
    }
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = Route
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = StatsResponse
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
    export type RequestParams = {}
    export type RequestQuery = {}
    export type RequestBody = never
    export type RequestHeaders = {}
    export type ResponseBody = string
  }
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios'
import axios from 'axios'

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType
  /** request body */
  body?: unknown
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private secure?: boolean
  private format?: ResponseType

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || '/api/v1',
    })
    this.secure = secure
    this.format = format
    this.securityWorker = securityWorker
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method)

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem)
    } else {
      return `${formItem}`
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key]
      const propertyContent: any[] = property instanceof Array ? property : [property]

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem))
      }

      return formData
    }, new FormData())
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const responseFormat = format || this.format || undefined

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>)
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body)
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    })
  }
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
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
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Verify a new agent and return the number of routes added
     *
     * @tags agent
     * @name Verify
     * @summary Verify a new agent
     * @request POST:/agent/verify
     * @response `200` `SuccessResponse` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    verify: (request: VerifyNewAgentRequest, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/agent/verify`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
    callback: (body: AuthUserPassAuthCallbackRequest, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/auth/callback`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
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
        method: 'HEAD',
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
        method: 'POST',
        ...params,
      }),

    /**
     * @description Logs out the user by invalidating the token
     *
     * @tags auth
     * @name Logout
     * @summary Logout
     * @request GET:/auth/logout
     * @response `302` `string` Redirects to home page
     */
    logout: (params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/auth/logout`,
        method: 'GET',
        ...params,
      }),

    /**
     * @description Logs out the user by invalidating the token
     *
     * @tags auth
     * @name Logout2
     * @summary Logout
     * @request POST:/auth/logout
     * @originalName logout
     * @duplicate
     * @response `302` `string` Redirects to home page
     */
    logout2: (params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/auth/logout`,
        method: 'POST',
        ...params,
      }),
  }
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
        method: 'GET',
        format: 'json',
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
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    renew: (params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/cert/renew`,
        method: 'GET',
        ...params,
      }),
  }
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
        method: 'GET',
        format: 'json',
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
        method: 'GET',
        format: 'json',
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
        method: 'GET',
        format: 'json',
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
        from?: string
        /** levels */
        levels?: string
        /** show stderr */
        stderr?: boolean
        /** show stdout */
        stdout?: boolean
        /** to timestamp */
        to?: string
      },
      params: RequestParams = {}
    ) =>
      this.request<void, ErrorResponse>({
        path: `/docker/logs/${id}`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
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
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  favicon = {
    /**
     * @description Get favicon
     *
     * @tags v1
     * @name Favicon
     * @summary Get favicon
     * @request GET:/favicon
     * @response `200` `(HomepageFetchResult)[]` OK
     * @response `400` `ErrorResponse` Bad Request: alias is empty or route is not HTTPRoute
     * @response `403` `ErrorResponse` Forbidden: unauthorized
     * @response `404` `ErrorResponse` Not Found: route or icon not found
     * @response `500` `ErrorResponse` Internal Server Error: internal error
     */
    favicon: (
      query?: {
        /** Alias of the route */
        alias?: string
        /** URL of the route */
        url?: string
      },
      params: RequestParams = {}
    ) =>
      this.request<HomepageFetchResult[], ErrorResponse>({
        path: `/favicon`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'blob',
        ...params,
      }),
  }
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
        filename: string
        type: 'config' | 'provider' | 'middleware'
      },
      params: RequestParams = {}
    ) =>
      this.request<string, ErrorResponse>({
        path: `/file/content`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
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
        filename: string
        /** Type */
        type: 'config' | 'provider' | 'middleware'
      },
      file: string,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/file/content`,
        method: 'PUT',
        query: query,
        body: file,
        type: ContentType.Text,
        format: 'json',
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
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
        type: 'config' | 'provider' | 'middleware'
      },
      file: string,
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/file/validate`,
        method: 'POST',
        query: query,
        body: file,
        type: ContentType.Text,
        format: 'json',
        ...params,
      }),
  }
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
     */
    categories: (params: RequestParams = {}) =>
      this.request<string[], ErrorResponse>({
        path: `/homepage/categories`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
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
        which: string
      },
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/item_click`,
        method: 'POST',
        query: query,
        type: ContentType.Json,
        format: 'json',
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
     */
    items: (
      query?: {
        /** Category filter */
        category?: string
        /** Provider filter */
        provider?: string
        /** Search query */
        search?: string
        /**
         * Sort method
         * @default "alphabetical"
         */
        sort_method?: 'clicks' | 'alphabetical' | 'custom'
      },
      params: RequestParams = {}
    ) =>
      this.request<HomepageCategory[], ErrorResponse>({
        path: `/homepage/items`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
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
    setCategoryOrder: (request: HomepageOverrideCategoryOrderParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/category_order`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
    setItem: (request: HomepageOverrideItemParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_all_sort_order`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
      params: RequestParams = {}
    ) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_fav_sort_order`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
    setItemFavorite: (request: HomepageOverrideItemFavoriteParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_favorite`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
    setItemSortOrder: (request: HomepageOverrideItemSortOrderParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_sort_order`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
    setItemVisible: (request: HomepageOverrideItemVisibleParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/item_visible`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
    setItemsBatch: (request: HomepageOverrideItemsBatchParams, params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/homepage/set/items_batch`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  icons = {
    /**
     * @description List icons
     *
     * @tags v1
     * @name Icons
     * @summary List icons
     * @request GET:/icons
     * @response `200` `(HomepageIconMetaSearch)[]` OK
     * @response `400` `ErrorResponse` Bad Request
     * @response `403` `ErrorResponse` Forbidden
     */
    icons: (
      query?: {
        /** Keyword */
        keyword?: string
        /** Limit */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HomepageIconMetaSearch[], ErrorResponse>({
        path: `/icons`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
          | 'cpu_average'
          | 'memory_usage'
          | 'memory_usage_percent'
          | 'disks_read_speed'
          | 'disks_write_speed'
          | 'disks_iops'
          | 'disk_usage'
          | 'network_speed'
          | 'network_transfer'
          | 'sensor_temperature'
        /** @format duration */
        interval?: string
        period?: '5m' | '15m' | '1h' | '1d' | '1mo'
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, SystemInfoAggregate>, ErrorResponse>({
        path: `/metrics/all_system_info`,
        method: 'GET',
        query: query,
        format: 'json',
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
        agentAddr?: string
        agentName?: string
        aggregate?:
          | 'cpu_average'
          | 'memory_usage'
          | 'memory_usage_percent'
          | 'disks_read_speed'
          | 'disks_write_speed'
          | 'disks_iops'
          | 'disk_usage'
          | 'network_speed'
          | 'network_transfer'
          | 'sensor_temperature'
        period?: '5m' | '15m' | '1h' | '1d' | '1mo'
      },
      params: RequestParams = {}
    ) =>
      this.request<SystemInfoAggregate, ErrorResponse>({
        path: `/metrics/system_info`,
        method: 'GET',
        query: query,
        format: 'json',
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
        interval?: '5m' | '15m' | '1h' | '1d' | '1mo'
        /** @example "" */
        keyword?: string
        /**
         * @default 0
         * @example 10
         */
        limit?: number
        /**
         * @default 0
         * @example 10
         */
        offset?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<UptimeAggregate, ErrorResponse>({
        path: `/metrics/uptime`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  }
  reload = {
    /**
     * @description Reload config
     *
     * @tags v1
     * @name Reload
     * @summary Reload config
     * @request POST:/reload
     * @response `200` `SuccessResponse` OK
     * @response `403` `ErrorResponse` Forbidden
     * @response `500` `ErrorResponse` Internal Server Error
     */
    reload: (params: RequestParams = {}) =>
      this.request<SuccessResponse, ErrorResponse>({
        path: `/reload`,
        method: 'POST',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List routes
     *
     * @tags route, websocket
     * @name Routes
     * @summary List routes
     * @request GET:/route/list
     * @response `200` `(Route)[]` OK
     * @response `403` `ErrorResponse` Forbidden
     */
    routes: (
      query?: {
        /** Provider */
        provider?: string
      },
      params: RequestParams = {}
    ) =>
      this.request<Route[], ErrorResponse>({
        path: `/route/list`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
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
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
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
        method: 'GET',
        type: ContentType.Json,
        ...params,
      }),
  }
}
