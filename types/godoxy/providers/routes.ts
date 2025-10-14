import type { RequestLogConfig } from '../config/access_log'
import type { RuleDo, RuleOn } from '../config/rules'
import type { MiddlewaresMap } from '../middlewares/middlewares'
import type { Duration, Hostname, IPv4, IPv6, PathPattern, Port, StreamPort } from '../types'
import type { HealthcheckConfig } from './healthcheck'
import type { HomepageConfig } from './homepage'
import type { LoadBalanceConfig } from './loadbalance'
export const PROXY_SCHEMES = ['http', 'https'] as const
export const STREAM_SCHEMES = ['tcp', 'udp'] as const

export type ProxyScheme = (typeof PROXY_SCHEMES)[number]
export type StreamScheme = (typeof STREAM_SCHEMES)[number]

export type RouteRule =
  | {
      /** Rule name */
      name?: string
      /** Rule criteria */
      on: RuleOn
      /** Rule do */
      do: RuleDo
    }
  | {
      /** Default rule */
      name: 'default'
      /** Rule do */
      do: RuleDo
    }

/** Local rule file */
type LocalRuleFile = `file://${string}`
/** Rule preset file */
type RulePresetFile = `embed://${string}`

type WithRuleOptions =
  | {
      /** Route Rules */
      rules?: RouteRule[]
    }
  | {
      /** Route Rule file */
      rule_file?: LocalRuleFile | RulePresetFile
    }

export type Route = (ReverseProxyRoute | FileServerRoute | StreamRoute) & {
  /** Route agent */
  agent?: string
} & WithRuleOptions

export type Routes = {
  [key: string]: Route
}

export type ReverseProxyRoute = {
  /** Alias (subdomain or FDN)
   * @minLength 1
   */
  alias?: string
  /** Proxy scheme
   *
   * @default http
   */
  scheme?: ProxyScheme
  /** Proxy host
   *
   * @default localhost
   */
  host?: Hostname | IPv4 | IPv6
  /** Proxy port
   *
   * @default 80
   */
  port?: Port
  /** Agent */
  agent?: string
  /** Healthcheck config */
  healthcheck?: HealthcheckConfig
  /** Load balance config */
  load_balance?: LoadBalanceConfig
  /** Middlewares */
  middlewares?: MiddlewaresMap
  /** Homepage config */
  homepage?: HomepageConfig
  /** Access log config */
  access_log?: RequestLogConfig
} & HTTPConfig

export type HTTPConfig = {
  /** Skip TLS verification
   *
   * @default false
   */
  no_tls_verify?: boolean
  /** Response header timeout
   *
   * @default 60s
   */
  response_header_timeout?: Duration
  /** Disable compression
   *
   * @default false
   */
  disable_compression?: boolean
  /** SNI server name */
  ssl_server_name?: string
  /** Path to trusted CA certificates */
  ssl_trusted_certificate?: string
  /** Path to client certificate */
  ssl_certificate?: string
  /** Path to client key */
  ssl_certificate_key?: string
  /** Allowed TLS protocols */
  ssl_protocols?: TLSProtocol[]
}

export type TLSProtocol = 'tlsv1.0' | 'tlsv1.1' | 'tlsv1.2' | 'tlsv1.3'

export type FileServerRoute = {
  /** Alias (subdomain or FDN)
   * @minLength 1
   */
  alias?: string
  scheme: 'fileserver'
  /* File server root path */
  root: string
  /** Path patterns (only patterns that match will be proxied).
   *
   * See https://pkg.go.dev/net/http#hdr-Patterns-ServeMux
   */
  path_patterns?: PathPattern[]
  /** Middlewares */
  middlewares?: MiddlewaresMap
  /** Homepage config */
  homepage?: HomepageConfig
  /** Access log config*/
  access_log?: RequestLogConfig
  /** Healthcheck config */
  healthcheck?: HealthcheckConfig
}

export type StreamRoute = {
  /** Alias (subdomain or FDN)
   * @minLength 1
   */
  alias?: string
  /** Stream scheme
   *
   * @default tcp
   */
  scheme?: StreamScheme
  /** Stream host
   *
   * @default localhost
   */
  host?: Hostname | IPv4 | IPv6
  /* Stream port */
  port: StreamPort | number
  /** Agent */
  agent?: string
  /** Healthcheck config */
  healthcheck?: HealthcheckConfig
}
