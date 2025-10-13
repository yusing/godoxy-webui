/**
 * @type "null"
 */
export type Null = null
export type Nullable<T> = T | Null
export type NullOrEmptyMap = object | Null

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'CONNECT',
  'HEAD',
  'OPTIONS',
  'TRACE',
] as const

/**
 * HTTP Method
 * @type string
 */
export type HTTPMethod = (typeof HTTP_METHODS)[number]

// "string & {}" Prevents skipping schema generation

/**
 * HTTP Header
 * @pattern ^[a-zA-Z0-9\-]+$
 * @type string
 */
export type HTTPHeader = string & {}

/**
 * HTTP Query
 * @pattern ^[a-zA-Z0-9\-_]+$
 * @type string
 */
export type HTTPQuery = string & {}
/**
 * HTTP Cookie
 * @pattern ^[a-zA-Z0-9\-_]+$
 * @type string
 */
export type HTTPCookie = string & {}

/**
 * Status code
 * @minimum 100
 * @maximum 599
 */
export type StatusCode = number | `${number}`
/**
 * Status code range
 * @minimum 100
 * @maximum 599
 */
export type StatusCodeRange = StatusCode | `${StatusCode}-${StatusCode}`

/**
 * Domain name
 * @pattern ^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$
 */
export type DomainName = string & {}
/**
 * Domain or wildcard domain
 * @pattern ^(\*\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$
 */
export type DomainOrWildcard = string & {}
/**
 * Hostname
 * @format hostname
 * @type string
 */
export type Hostname = string & {}
/**
 * IPv4 address
 * @format ipv4
 * @type string
 */
export type IPv4 = string & {}
/**
 * IPv6 address
 * @format ipv6
 * @type string
 */
export type IPv6 = string & {}

/* CIDR / IPv4 / IPv6 */
export type CIDR =
  | `${number}.${number}.${number}.${number}`
  | `${string}:${string}:${string}:${string}:${string}:${string}:${string}:${string}`
  | `${number}.${number}.${number}.${number}/${number}`
  | `::${number}`
  | `${string}::/${number}`
  | `${string}:${string}::/${number}`

/**
 * Port number
 *
 * @type integer
 * @minimum 0
 * @maximum 65535
 */
export type Port = number | `${number}`

/**
 * Stream port
 *
 * @pattern ^\d+:\d+$
 * @type string
 * @minimum 0
 * @maximum 65535
 */
export type StreamPort = Port | `${Port}:${Port}`

/**
 * Email address
 * @format email
 * @type string
 */
export type Email = string & {}

/**
 * URL
 * @format uri
 * @type string
 */
export type URL = string & {}

/**
 * URI
 * @format uri-reference
 * @type string
 */
export type URI = string & {}

/**
 * Path pattern
 * @pattern ^(?:([A-Z]+) )?(?:([a-zA-Z0-9.-]+)\\/)?(\\/[^\\s]*)$
 * @type string
 */
export type PathPattern = string & {}

/**
 * Duration
 * @pattern ^\d+(?:us|ms|s|m|h|d|w|M)$
 * @type string
 */
export type Duration = `${number}${'us' | 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M'}`

/**
 * Date time
 * @format date-time
 * @type string
 */
export type DateTime = string & {}

/**
 * Glob pattern
 * @pattern ^[a-zA-Z0-9\-\_\.\*]+$
 * @type string
 */
export type Glob = string & {}

/**
 * Go template
 * @type string
 * @description A template is a string that contains variables enclosed in curly braces.
 * @examples ["{{ .Request.Method }} {{ .Request.URL }} {{ .Response.StatusCode }}"]
 */
export type Template = string & {}

/**
 * Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'panic'
