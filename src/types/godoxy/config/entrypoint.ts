import type { EntrypointMiddlewares } from '../middlewares/middleware_compose'
import type { RouteRule } from '../providers/routes'
import type { RequestLogConfig } from './access_log'

export type EntrypointConfig = {
  /** @deprecated */
  support_proxy_protocol?: boolean
  /** Source-authenticated Proxy Protocol handling */
  proxy_protocol?: ProxyProtocolConfig
  /** Named inbound mTLS profile enforced for all HTTPS traffic on this entrypoint */
  inbound_mtls_profile?: string
  /** Entrypoint middleware configuration */
  middlewares?: EntrypointMiddlewares
  /** Entrypoint access log configuration */
  access_log?: RequestLogConfig
  /** Entrypoint rules */
  rules?: {
    /** Not found rules */
    not_found?: RouteRule[]
  }
}

export type ProxyProtocolConfig = {
  mode: 'disabled' | 'mixed' | 'required'
  /** IP addresses or CIDR ranges permitted to send Proxy Protocol headers */
  trusted_proxies?: string[]
}
