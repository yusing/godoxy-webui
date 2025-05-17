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
] as const;

export type MiddlewareBase = {
  bypass?: RuleOn[];
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
type LooseUse<Use extends string> = _LooseUseInternal<Use>[number];

type KeyOptMapping<T extends MiddlewareComposeBase> = {
  [key in T["use"]]: OmitUse<T>;
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
  | UseMiddlewareFileRef
) & {
  bypass?: RuleOn[];
};

export type CustomErrorPage = {
  /**
   * @title CustomErrorPage
   */
  use: LooseUse<"error_page" | "custom_error_page">;
};

export type RedirectHTTP = {
  /**
   * @title RedirectHTTP
   */
  use: LooseUse<"redirect_http">;
  /** Bypass redirect */
  // bypass?: {
  //   /** Bypass redirect for user agents */
  //   user_agents?: string[];
  // };
};

export type SetXForwarded = {
  /**
   * @title SetXForwarded
   */
  use: LooseUse<"set_x_forwarded">;
};

export type HideXForwarded = {
  /**
   * @title HideXForwarded
   */
  use: LooseUse<"hide_x_forwarded">;
};

export type CIDRWhitelist = {
  /**
   * @title CIDRWhitelist
   */
  use: LooseUse<"cidr_whitelist">;
  /* Allowed CIDRs/IPs */
  allow: CIDR[];
  /** HTTP status code when blocked
   *
   * @default 403
   */
  status_code?: StatusCode;
  /** HTTP status code when blocked (alias of status_code)
   *
   * @default 403
   */
  status?: StatusCode;
  /** Error message when blocked
   *
   * @default "IP not allowed"
   */
  message?: string;
};

export type CloudflareRealIP = {
  /**
   * @title CloudflareRealIP
   */
  use: LooseUse<"cloudflare_real_ip">;
};

export type ModifyRequest = {
  /**
   * @title ModifyRequest
   */
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
  /**
   * @title ModifyResponse
   */
  use: LooseUse<"modify_response" | "response">;
  /** Set HTTP headers */
  set_headers?: Record<HTTPHeader, string>;
  /** Add HTTP headers */
  add_headers?: Record<HTTPHeader, string>;
  /** Hide HTTP headers */
  hide_headers?: HTTPHeader[];
};

export type OIDC = {
  /**
   * @title OIDC
   */
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
  /**
   * @title hCaptcha
   */
  use: LooseUse<"h_captcha">;
  // site key
  site_key: string;
  // secret key
  secret_key: string;
  /** Session expiration
   *
   * @default 24h
   */
  session_expiry?: Duration;
};

export type RateLimit = {
  /**
   * @title RateLimit
   */
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
  /**
   * @title RealIP
   */
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
