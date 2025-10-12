import type { CIDR, Duration, IPv4, IPv6 } from '../types'
import type { ACLLogConfig } from './access_log'

export type ACLMatcher = IPMatcher | CIDRMatcher | CountryISOMatcher | TimezoneMatcher

/**
 * IP matcher
 *
 * @type string
 * @example ["ip:192.168.1.1"]
 */
export type IPMatcher = `ip:${IPv4 | IPv6}`

/**
 * CIDR matcher
 *
 * @type string
 * @example ["cidr:192.168.1.0/24"]
 */
export type CIDRMatcher = `cidr:${CIDR}`

/**
 * Country ISO matcher
 *
 * @type string
 * @pattern country:\w{2}
 * @example ["country:US"]
 */
export type CountryISOMatcher = `country:${string}`

/**
 * Timezone matcher
 *
 * @type string
 * @pattern tz:\w+\/\w+
 * @example ["tz:America/New_York"]
 */
export type TimezoneMatcher = `tz:${string}/${string}`

/**
 * ACL config
 */
export type ACLConfig = {
  /**
   * Default action
   * @default "allow"
   */
  default?: 'allow' | 'deny'
  /**
   * Allow local addresses
   * @default true
   */
  allow_local?: boolean
  /**
   * Allow list
   */
  allow?: ACLMatcher[]
  /**
   * Deny list
   */
  deny?: ACLMatcher[]
  /**
   * ACL logger
   */
  log?: ACLLogConfig
  /**
   * ACL Summary notifer
   */
  notify?: {
    /**
     * Notification interval
     * @default 1m
     */
    interval?: Duration
    /**
     * Notification provider names
     */
    to?: string[]
    /**
     * Include allowed IPs?
     * @default false
     */
    include_allowed?: boolean
  }
}
