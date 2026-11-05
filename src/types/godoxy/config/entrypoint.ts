import type { EntrypointMiddlewares } from '../middlewares/middleware_compose'
import type { RequestLogConfig } from './access_log'

export type EntrypointConfig = {
  /** @deprecated */
  support_proxy_protocol?: boolean
  /** Source-authenticated Proxy Protocol handling */
  proxy_protocol?: ProxyProtocolConfig
  /** Named inbound mTLS profile enforced for all HTTPS traffic on this entrypoint */
  inbound_mtls_profile?: string
  /** Reject HTTPS requests without SNI or with Host and SNI selecting different routes */
  strict_sni?: boolean
  /** Entrypoint middleware configuration */
  middlewares?: EntrypointMiddlewares
  /** Entrypoint access log configuration */
  access_log?: RequestLogConfig
  /** Entrypoint rules */
  rules?: {
    /**
     * Block-syntax rules for ordinary requests with no matching host route or short link.
     * Unhandled requests fall back to the normal 404 response.
     */
    not_found?: string
  }
}

export type ProxyProtocolConfig = {
  mode: 'disabled' | 'mixed' | 'required'
  /** IP addresses or CIDR ranges permitted to send Proxy Protocol headers */
  trusted_proxies?: string[]
}
