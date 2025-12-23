import type { HealthcheckConfig } from '../providers/healthcheck'
import type { DomainName } from '../types'
import type { ACLConfig } from './acl'
import type { AutocertConfig } from './autocert'
import type { EntrypointConfig } from './entrypoint'
import type { HomepageConfig } from './homepage'
import type { Providers } from './providers'

export type Config = {
  /** Optional access control configuration */
  acl?: ACLConfig
  /** Optional autocert configuration */
  autocert?: AutocertConfig
  /** Optional entrypoint configuration */
  entrypoint?: EntrypointConfig
  /** Providers configuration (include file, docker, notification) */
  providers: Providers
  /** List of domains to match
   *
   * @minItems 1
   * @default []
   */
  match_domains?: DomainName[]
  /** Homepage configuration */
  homepage?: HomepageConfig
  /**
   * Default values
   * @additionalProperties false
   */
  defaults?: {
    healthcheck?: HealthcheckConfig
  }
  /**
   * Optional timeout before shutdown
   * @default 3
   * @minimum 1
   */
  timeout_shutdown?: number
}
