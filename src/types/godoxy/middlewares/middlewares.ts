import type { RuleOn } from "../config/rules";
import type { CIDR, Duration, HTTPHeader, StatusCode } from "../types";

export const ALL_MIDDLEWARES = [
  "ErrorPage",
  "RedirectHTTP",
  "SetXForwarded",
  "HideXForwarded",
  "CIDRWhitelist",
  "CloudflareRealIP",
  "ModifyRequest",
  "ModifyResponse",
  "OIDC",
  "RateLimit",
  "RealIP",
  "hCaptcha",
  "ModifyHTML",
] as const;

export type MiddlewareBase = {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[];
  /**
   * Priority
   */
  priority?: number;
};

type MiddlewareFileRef = `${string}@file`;
/**
 * @type object
 * @patternProperties {"^.*@file$": {"type": "null"}}
 */
type UseMiddlewareFileRef = {
  use: MiddlewareFileRef;
};
interface MiddlewareComposeBase extends MiddlewareBase {
  use: string;
}
type OmitUse<T extends MiddlewareComposeBase> = Omit<T, "use">;

// Helper type to capitalize the first letter of a string
type Title<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;

// Helper type to convert snake_case to camelCase or PascalCase
// This version preserves the case of the first part before an underscore (e.g., FOO_BAR -> FOOBar)
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Title<SnakeToCamel<U>> | Uppercase<SnakeToCamel<U>>}`
  : S;

// Helper type to convert snake_case to PascalCase (e.g., foo_bar -> FooBar, FOO_BAR -> FOOBar)
type SnakeToPascal<S extends string> = Title<SnakeToCamel<S>>;

// Core logic for generating all variations
type _LooseUseInternal<Str extends string> = (
  | SnakeToCamel<Str>
  | SnakeToPascal<Str>
  | Str
)[];

// Expands all variations of the string to a union
// type LooseUse<Use extends string> = _LooseUseInternal<Use>[number];
type LooseUse<Use extends string> = Use;

type KeyOptMapping<T extends MiddlewareComposeBase> = {
  [key in T["use"]]: OmitUse<T>;
} & {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[];
};

export interface MiddlewaresMap
  extends KeyOptMapping<CustomErrorPage>,
    KeyOptMapping<RedirectHTTP>,
    KeyOptMapping<SetXForwarded>,
    KeyOptMapping<HideXForwarded>,
    KeyOptMapping<CIDRWhitelist>,
    KeyOptMapping<CloudflareRealIP>,
    KeyOptMapping<ModifyRequest>,
    KeyOptMapping<ModifyResponse>,
    KeyOptMapping<OIDC>,
    KeyOptMapping<RateLimit>,
    KeyOptMapping<RealIP>,
    KeyOptMapping<ModifyHTML>,
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
  | UseMiddlewareFileRef
) & {
  /**
   * Bypass rules
   */
  bypass?: RuleOn[];
};

export type CustomErrorPage = {
  /** error_page */
  use: LooseUse<"error_page" | "custom_error_page">;
};

export type RedirectHTTP = {
  /** redirect_http */
  use: LooseUse<"redirect_http">;
  /** Bypass redirect */
  // bypass?: {
  //   /** Bypass redirect for user agents */
  //   user_agents?: string[];
  // };
};

export type SetXForwarded = {
  /** set_x_forwarded */
  use: LooseUse<"set_x_forwarded">;
};

export type HideXForwarded = {
  /** hide_x_forwarded */
  use: LooseUse<"hide_x_forwarded">;
};

export type CIDRWhitelist = {
  /** cidr_whitelist */
  use: LooseUse<"cidr_whitelist">;
  /* Allowed CIDRs/IPs */
  allow: CIDR[];
  /** HTTP status code
   *
   * @default 403
   */
  status_code?: StatusCode;
  /** HTTP status code
   *
   * @default 403
   */
  status?: StatusCode;
  /** Block message
   *
   * @default "IP not allowed"
   */
  message?: string;
};

export type CloudflareRealIP = {
  /** cloudflare_real_ip */
  use: LooseUse<"cloudflare_real_ip">;
};

export type ModifyRequest = {
  /** modify_request */
  use: LooseUse<"modify_request" | "request">;
  /** Set HTTP headers */
  set_headers?: Record<HTTPHeader, string>;
  /** Add HTTP headers */
  add_headers?: Record<HTTPHeader, string>;
  /** Hide HTTP headers */
  hide_headers?: HTTPHeader[];
  /** Add prefix to request URL */
  add_prefix?: string;
};

export type ModifyResponse = {
  /** modify_response */
  use: LooseUse<"modify_response" | "response">;
  /** Set HTTP headers */
  set_headers?: Record<HTTPHeader, string>;
  /** Add HTTP headers */
  add_headers?: Record<HTTPHeader, string>;
  /** Hide HTTP headers */
  hide_headers?: HTTPHeader[];
};

export type OIDC = {
  /** oidc */
  use: LooseUse<"oidc">;
  /** Allowed users
   *
   * @minItems 1
   */
  allowed_users?: string[];
  /** Allowed groups
   *
   * @minItems 1
   */
  allowed_groups?: string[];
};

export type hCaptcha = {
  /** h_captcha */
  use: LooseUse<"h_captcha">;
  /**
   * Site key
   */
  site_key: string;
  /**
   * Secret key
   */
  secret_key: string;
  /** Session expiration
   *
   * @default 24h
   */
  session_expiry?: Duration;
};

export type RateLimit = {
  /** rate_limit */
  use: LooseUse<"rate_limit">;
  /** Average number of requests allowed in a period
   *
   * @min 1
   */
  average: number;
  /** Maximum number of requests allowed in a period
   *
   * @min 1
   */
  burst: number;
  /** Duration of the rate limit
   *
   * @default 1s
   */
  period?: Duration;
};

export type RealIP = {
  /** real_ip */
  use: LooseUse<"real_ip">;
  /** Header to get the client IP from
   *
   * @default "X-Real-IP"
   */
  header?: HTTPHeader;
  from: CIDR[];
  /** Recursive resolve the IP
   *
   * @default false
   */
  recursive?: boolean;
};

export type ModifyHTML = {
  /** modify_html */
  use: LooseUse<"modify_html">;
  /** CSS Selector */
  target: string;
  /** HTML to modify */
  html: string;
  /** Replace HTML
   *
   * @default false
   */
  replace?: boolean;
};
