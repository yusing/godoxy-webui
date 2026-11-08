import type { Duration, SilenceWindow, URI } from '../types'

/**
 * @additionalProperties false
 */
export type HealthcheckConfig = {
  /** Disable healthcheck
   *
   * @default false
   */
  disable?: boolean
  /** Healthcheck path
   *
   * @default /
   */
  path?: URI
  /**
   * Use GET instead of HEAD
   *
   * @title Use GET
   *
   * @default false
   */
  use_get?: boolean
  /** Healthcheck interval
   *
   * @default 5s
   */
  interval?: Duration
  /** Healthcheck timeout
   *
   * @default 5s
   */
  timeout?: Duration
  /** Retries
   *
   * @example -1 (immediate), >=0 (threshold)
   * @default 3
   */
  retries?: number
  /** Daily local-time windows without "service down" notifications
   *
   * Inherits `defaults.healthcheck.silence` when unset; `[]` opts out.
   *
   * @example ["02:00-04:30", "23:30-00:30"]
   */
  silence?: SilenceWindow[]
}
