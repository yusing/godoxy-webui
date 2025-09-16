import type { DomainOrWildcard, Email } from '../types'

export const AUTOCERT_PROVIDERS = [
  'local',
  'custom',
  'cloudflare',
  'clouddns',
  'duckdns',
  'ovh',
  'porkbun',
] as const

export type AutocertProvider = (typeof AUTOCERT_PROVIDERS)[number]

export type AutocertConfig =
  | LocalOptions
  | CustomOptions
  | CloudflareOptions
  | CloudDNSOptions
  | DuckDNSOptions
  | OVHOptionsWithAppKey
  | OVHOptionsWithOAuth2Config
  | PorkbunOptions
  | OtherOptions

export interface AutocertConfigBase {
  /** ACME email */
  email: Email
  /** ACME domains */
  domains: DomainOrWildcard[]
  /** ACME certificate path */
  cert_path?: string
  /** ACME key path */
  key_path?: string
  /** DNS resolvers */
  resolvers?: string[]
}

export interface LocalOptions {
  provider: 'local'
  /** ACME certificate path */
  cert_path?: string
  /**  ACME key path */
  key_path?: string
  options?: object | null
}

export interface CustomOptions extends AutocertConfigBase {
  provider: 'custom'
  /** CA Directory URL */
  ca_dir_url?: string
  /** CA Certs */
  ca_certs?: string[]
  /** EAB Key ID */
  eab_kid?: string
  /** EAB HMAC base64 */
  eab_hmac?: string
}

export interface CloudflareOptions extends AutocertConfigBase {
  provider: 'cloudflare'
  options: { auth_token: string }
}

export interface CloudDNSOptions extends AutocertConfigBase {
  provider: 'clouddns'
  options: {
    client_id: string
    email: Email
    password: string
  }
}

export interface DuckDNSOptions extends AutocertConfigBase {
  provider: 'duckdns'
  options: {
    token: string
  }
}

export interface PorkbunOptions extends AutocertConfigBase {
  provider: 'porkbun'
  options: {
    api_key: string
    secret_api_key: string
  }
}
export const OVH_ENDPOINTS = [
  'ovh-eu',
  'ovh-ca',
  'ovh-us',
  'kimsufi-eu',
  'kimsufi-ca',
  'soyoustart-eu',
  'soyoustart-ca',
] as const

export type OVHEndpoint = (typeof OVH_ENDPOINTS)[number]

export interface OVHOptionsWithAppKey extends AutocertConfigBase {
  provider: 'ovh'
  options: {
    application_secret: string
    consumer_key: string
    api_endpoint?: OVHEndpoint
    application_key: string
  }
}

export interface OVHOptionsWithOAuth2Config extends AutocertConfigBase {
  provider: 'ovh'
  options: {
    application_secret: string
    consumer_key: string
    api_endpoint?: OVHEndpoint
    oauth2_config: {
      client_id: string
      client_secret: string
    }
  }
}

export interface OtherOptions extends AutocertConfigBase {
  provider: string
  options: object
}
