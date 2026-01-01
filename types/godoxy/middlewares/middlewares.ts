import type { RuleOn } from '../config/rules'
import type { CIDR, Duration, HTTPHeader, StatusCode, Stringable } from '../types'

export const ALL_MIDDLEWARES = [
  'ErrorPage',
  'RedirectHTTP',
  'SetXForwarded',
  'HideXForwarded',
  'CIDRWhitelist',
  'CloudflareRealIP',
  'ModifyRequest',
  'ModifyResponse',
  'OIDC',
  'ForwardAuth',
  'RateLimit',
  'RealIP',
  'hCaptcha',
  'ModifyHTML',
  'Themed',
] as const

export type MiddlewareBase = {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[]
  /**
   * Priority
   */
  priority?: number
}

export type MiddlewareFileRef = `${string}@file`
/**
 * @type object
 * @patternProperties {"^.*@file$": {"type": "null"}}
 */
type UseMiddlewareFileRef = {
  use: MiddlewareFileRef
}
interface MiddlewareComposeBase extends MiddlewareBase {
  use: string
}
type OmitUse<T extends MiddlewareComposeBase> = Omit<T, 'use'>

// Helper type to capitalize the first letter of a string
// type Title<S extends string> = S extends `${infer First}${infer Rest}`
//   ? `${Uppercase<First>}${Rest}`
//   : S;

// Helper type to convert snake_case to camelCase or PascalCase
// This version preserves the case of the first part before an underscore (e.g., FOO_BAR -> FOOBar)
// type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
//   ? `${T}${Title<SnakeToCamel<U>> | Uppercase<SnakeToCamel<U>>}`
//   : S;

// Helper type to convert snake_case to PascalCase (e.g., foo_bar -> FooBar, FOO_BAR -> FOOBar)
// type SnakeToPascal<S extends string> = Title<SnakeToCamel<S>>;

// Core logic for generating all variations
// type _LooseUseInternal<Str extends string> = (
//   | SnakeToCamel<Str>
//   | SnakeToPascal<Str>
//   | Str
// )[];

// Expands all variations of the string to a union
// type LooseUse<Use extends string> = _LooseUseInternal<Use>[number];
type LooseUse<Use extends string> = Use

type KeyOptMapping<T extends MiddlewareComposeBase> = Record<T['use'], OmitUse<T>> & {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[]
}

export interface MiddlewaresMap
  extends
    KeyOptMapping<CustomErrorPage>,
    KeyOptMapping<RedirectHTTP>,
    KeyOptMapping<SetXForwarded>,
    KeyOptMapping<HideXForwarded>,
    KeyOptMapping<CIDRWhitelist>,
    KeyOptMapping<CloudflareRealIP>,
    KeyOptMapping<ModifyRequest>,
    KeyOptMapping<ModifyResponse>,
    KeyOptMapping<OIDC>,
    KeyOptMapping<ForwardAuth>,
    KeyOptMapping<RateLimit>,
    KeyOptMapping<RealIP>,
    KeyOptMapping<ModifyHTML>,
    KeyOptMapping<Themed>,
    KeyOptMapping<UseMiddlewareFileRef> {}

export type MiddlewareComposeItem = (
  | CustomErrorPage
  | RedirectHTTP
  | SetXForwarded
  | HideXForwarded
  | CIDRWhitelist
  | CloudflareRealIP
  | ModifyRequest
  | ModifyResponse
  | OIDC
  | RateLimit
  | RealIP
  | ModifyHTML
  | Themed
  | ForwardAuth
  | UseMiddlewareFileRef
) & {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[]
}

export type CustomErrorPage = {
  /** Middleware */
  use: LooseUse<'error_page' | 'custom_error_page'>
}

export type RedirectHTTP = {
  /** Middleware */
  use: LooseUse<'redirect_http'>
  /** Bypass redirect */
  // bypass?: {
  //   /** Bypass redirect for user agents */
  //   user_agents?: string[];
  // };
}

export type SetXForwarded = {
  /** Middleware */
  use: LooseUse<'set_x_forwarded'>
}

export type HideXForwarded = {
  /** Middleware */
  use: LooseUse<'hide_x_forwarded'>
}

export type CIDRWhitelist = {
  /** Middleware */
  use: LooseUse<'cidr_whitelist'>
  /* Allowed CIDRs/IPs */
  allow: CIDR[]
  /** HTTP status code
   *
   * @default 403
   */
  status_code?: StatusCode
  /** HTTP status code
   *
   * @default 403
   */
  status?: StatusCode
  /** Block message
   *
   * @default "IP not allowed"
   */
  message?: string
}

export type CloudflareRealIP = {
  /** Middleware */
  use: LooseUse<'cloudflare_real_ip'>
}

export type ModifyRequest = {
  /** Middleware */
  use: LooseUse<'modify_request' | 'request'>
  /** Set HTTP headers */
  set_headers?: Record<HTTPHeader, Stringable>
  /** Add HTTP headers */
  add_headers?: Record<HTTPHeader, Stringable>
  /** Hide HTTP headers */
  hide_headers?: HTTPHeader[]
  /** Add prefix to request URL */
  add_prefix?: string
}

export type ModifyResponse = {
  /** Middleware */
  use: LooseUse<'modify_response' | 'response'>
  /** Set HTTP headers */
  set_headers?: Record<HTTPHeader, Stringable>
  /** Add HTTP headers */
  add_headers?: Record<HTTPHeader, Stringable>
  /** Hide HTTP headers */
  hide_headers?: HTTPHeader[]
}

export type OIDC = {
  /** Middleware */
  use: LooseUse<'oidc'>
  /** Allowed users
   *
   * @minItems 1
   */
  allowed_users?: string[]
  /** Allowed groups
   *
   * @minItems 1
   */
  allowed_groups?: string[]
}

export type ForwardAuth = {
  /** Middleware */
  use: LooseUse<'forward_auth'>
  /** Auth route name
   *
   * @default "tinyauth"
   */
  route?: string
  /** Auth endpoint
   *
   * @default "/api/auth/traefik"
   */
  auth_endpoint?: string
  /** Additional response headers
   *
   * @default ["Remote-User", "Remote-Name", "Remote-Email", "Remote-Groups"]
   */
  headers?: HTTPHeader[]
}

export type hCaptcha = {
  /** Middleware */
  use: LooseUse<'h_captcha'>
  /**
   * Site key
   */
  site_key: string
  /**
   * Secret key
   */
  secret_key: string
  /** Session expiration
   *
   * @default 24h
   */
  session_expiry?: Duration
}

export type RateLimit = {
  /** Middleware */
  use: LooseUse<'rate_limit'>
  /** Average number of requests allowed in a period
   *
   * @min 1
   */
  average: number
  /** Maximum number of requests allowed in a period
   *
   * @min 1
   */
  burst: number
  /** Duration of the rate limit
   *
   * @default 1s
   */
  period?: Duration
}

export type RealIP = {
  /** Middleware */
  use: LooseUse<'real_ip'>
  /** Header to get the client IP from
   *
   * @default "X-Real-IP"
   */
  header?: HTTPHeader
  from: CIDR[]
  /** Recursive resolve the IP
   *
   * @default false
   */
  recursive?: boolean
}

export type ModifyHTML = {
  /** Middleware */
  use: LooseUse<'modify_html'>
  /** CSS Selector */
  target: string
  /** HTML to modify */
  html: string
  /** Replace HTML
   *
   * @default false
   */
  replace?: boolean
}

export type Themed = {
  /** Middleware */
  use: LooseUse<'themed'>
  /** Predefined themes */
  theme?: 'dark' | 'dark-grey' | 'solarized-dark'
  /** Custom CSS */
  css?: string
  /** Font URL */
  font_url?: string
  /** Font family */
  font_family?: string
}
