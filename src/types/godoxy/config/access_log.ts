import type {
  CIDR,
  Duration,
  Hostname,
  HTTPHeader,
  HTTPMethod,
  StatusCodeRange,
  URI,
} from "../types";

export const REQUEST_LOG_FORMATS = ["combined", "common", "json"] as const;

export type RequestLogFormat = (typeof REQUEST_LOG_FORMATS)[number];

export type AccessLogConfigBase = {
  /**
   * The path to the access log file.
   */
  path?: URI;
  /**
   * Log to stdout
   * @default false
   */
  stdout?: boolean;
  /**
   * Retention policy
   *
   * @default "30 days"
   */
  keep?: RetentionPolicy;
  /**
   * Rotation interval
   *
   * @default "1 day"
   */
  rotate?: Duration;
};

export type LogKeepDays = `${number} ${"days" | "weeks" | "months"}`;
export type LogKeepLast = `last ${number}`;
export type LogKeepSize =
  `${number} ${"KB" | "MB" | "GB" | "kb" | "mb" | "gb"}`;
export type RetentionPolicy = LogKeepDays | LogKeepLast | LogKeepSize;

export interface RequestLogConfig extends AccessLogConfigBase {
  /** The format of the access log.
   *
   * @default "combined"
   */
  format?: RequestLogFormat;
  /**
   * The access log filters.
   */
  filters?: RequestAccessLogFilters;
  /**
   * The access log fields.
   */
  fields?: LogFields;
}

export interface ACLLogConfig extends AccessLogConfigBase {
  /**
   * Whether log allowed IPs
   * @default false
   */
  log_allowed?: boolean;
}

export type RequestAccessLogFilter<T> = {
  /** Whether the filter is negative.
   *
   * @default false
   */
  negative?: boolean;
  /* The values to filter. */
  values: T[];
};

export type RequestAccessLogFilters = {
  /* Status code filter. */
  status_code?: RequestAccessLogFilter<StatusCodeRange>;
  /* Method filter. */
  method?: RequestAccessLogFilter<HTTPMethod>;
  /* Host filter. */
  host?: RequestAccessLogFilter<Hostname>;
  /* Header filter. */
  headers?: RequestAccessLogFilter<HTTPHeader>;
  /* CIDR filter. */
  cidr?: RequestAccessLogFilter<CIDR>;
};

export const LOG_FIELD_MODES = ["keep", "drop", "redact"] as const;
export type LogFieldMode = (typeof LOG_FIELD_MODES)[number];

export type LogField = {
  default?: LogFieldMode;
  config: {
    [key: string]: LogFieldMode;
  };
};

export type LogFields = {
  header?: LogField;
  query?: LogField;
  cookie?: LogField;
};
