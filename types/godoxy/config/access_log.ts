import type {
  CIDR,
  Duration,
  Hostname,
  HTTPHeader,
  HTTPMethod,
  StatusCodeRange,
  URI,
} from '../types'

export const REQUEST_LOG_FORMATS = ['combined', 'common', 'json'] as const
/**
 * Access log format
 *
 * @default "combined"
 */
export type RequestLogFormat = (typeof REQUEST_LOG_FORMATS)[number]

export type AccessLogConfigBase = {
  /**
   * Access log file path
   */
  path?: URI
  /**
   * Log to stdout
   * @default false
   */
  stdout?: boolean
  /**
   * Retention policy
   *
   * @default "30 days"
   */
  keep?: RetentionPolicy
  /**
   * Retention policy
   *
   * @default "30 days"
   */
  retention?: RetentionPolicy
  /**
   * Rotation interval
   *
   * @default "24h"
   */
  rotate_interval?: Duration
}

export type LogKeepDays = `${number} ${'days' | 'weeks' | 'months'}`
export type LogKeepLast = `last ${number}`
export type LogKeepSize = `${number} ${'KB' | 'MB' | 'GB' | 'kb' | 'mb' | 'gb'}`
/**
 * Retention policy
 *
 * @default "30 days"
 */
export type RetentionPolicy = LogKeepDays | LogKeepLast | LogKeepSize

export type RequestLogConfig = AccessLogConfigBase & {
  /**
   * Access log format
   * @default "combined"
   */
  format?: RequestLogFormat
  /**
   * Access log filters
   */
  filters?: RequestLogFilters
  /**
   * Access log fields
   */
  fields?: RequestLogFields
}

export type ACLLogConfig = AccessLogConfigBase & {
  /**
   * Log allowed IPs?
   * @default false
   */
  log_allowed?: boolean
}

export type RequestAccessLogFilter<T> = {
  /**
   * Negative filter?
   * @default false
   */
  negative?: boolean
  /**
   * Filter values
   */
  values: T[]
}

export type RequestLogFilters = {
  /** Status code filter */
  status_code?: RequestAccessLogFilter<StatusCodeRange>
  /** Method filter*/
  method?: RequestAccessLogFilter<HTTPMethod>
  /** Host filter*/
  host?: RequestAccessLogFilter<Hostname>
  /** Header filter*/
  headers?: RequestAccessLogFilter<HTTPHeader>
  /** CIDR filter*/
  cidr?: RequestAccessLogFilter<CIDR>
}

export const LOG_FIELD_MODES = ['keep', 'drop', 'redact'] as const
export type LogFieldMode = (typeof LOG_FIELD_MODES)[number]

export type LogField = {
  /** Default mode */
  default?: LogFieldMode
  /** Field configuration */
  config: Record<string, LogFieldMode>
}

export type RequestLogFields = {
  /** Headers */
  headers?: LogField
  /** Query */
  query?: LogField
  /** Cookies */
  cookies?: LogField
}
