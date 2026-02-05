import type { RealIP } from '../middlewares/middlewares'
import type { Duration } from '../types'

export const LOAD_BALANCE_MODES = ['round_robin', 'least_conn', 'ip_hash'] as const
export type LoadBalanceMode = (typeof LOAD_BALANCE_MODES)[number]

export type LoadBalanceConfigBase = {
  /** Load-balancer alias
   *
   * @minLength 1
   */
  link: string
  /** Load-balance weight
   *
   * @minimum 0
   * @maximum 100
   */
  weight?: number
  /** Enable sticky sessions
   *
   * @default false
   */
  sticky?: boolean
  /** Maximum age of sticky sessions
   *
   * @default 1h
   */
  sticky_max_age?: Duration
}

export type LoadBalanceConfig = LoadBalanceConfigBase &
  (
    | { mode: undefined } // linking other routes
    | RoundRobinLoadBalanceConfig
    | LeastConnLoadBalanceConfig
    | IPHashLoadBalanceConfig
  )

export type IPHashLoadBalanceConfig = {
  mode: 'ip_hash'
  /** Real IP config */
  options: RealIP
}

export type LeastConnLoadBalanceConfig = {
  mode: 'least_conn'
}

export type RoundRobinLoadBalanceConfig = {
  mode: 'round_robin'
}
