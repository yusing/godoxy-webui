import type { EntrypointMiddlewares } from '../middlewares/middleware_compose'
import type { RequestLogConfig } from './access_log'

export type EntrypointConfig = {
  /** Enable support for proxy protocol */
  support_proxy_protocol?: boolean
  /** Entrypoint middleware configuration */
  middlewares?: EntrypointMiddlewares
  /** Entrypoint access log configuration */
  access_log?: RequestLogConfig
}
