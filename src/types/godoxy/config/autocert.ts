import type { DomainOrWildcard, Email } from '../types'

export const AUTOCERT_PROVIDERS = [
  'local',
  'custom',
  'cloudflare',
  'clouddns',
  'desec',
  'duckdns',
  'ovh',
  'porkbun',
] as const

export type AutocertProvider = (typeof AUTOCERT_PROVIDERS)[number]

export type AutocertExtra =
  | Partial<LocalOptions>
  | Partial<CustomOptions>
  | Partial<CloudflareOptions>
  | Partial<CloudDNSOptions>
  | Partial<DeSECOptions>
  | Partial<DuckDNSOptions>
  | Partial<OVHOptionsWithAppKey>
  | Partial<OVHOptionsWithOAuth2Config>
  | Partial<PorkbunOptions>
  | Partial<OtherOptions>

export type AutocertConfigWithoutExtra =
  | LocalOptions
  | CustomOptions
  | CloudflareOptions
  | CloudDNSOptions
  | DeSECOptions
  | DuckDNSOptions
  | OVHOptionsWithAppKey
  | OVHOptionsWithOAuth2Config
  | PorkbunOptions
  | OtherOptions

export type AutocertConfig = AutocertConfigWithoutExtra & {
  /** Extra certificates */
  extra?: AutocertExtra[]
}

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
  /** CA Directory URL */
  ca_dir_url?: string
  /**
   * Private key algorithm for the ACME-issued TLS certificate (server default: EC256).
   * Examples: `EC256`, `RSA2048`, `RSA4096`. Use RSA when clients lack ECDSA (e.g. some IoT TLS).
   */
  certificate_key_type?: 'EC256' | 'EC384' | 'RSA2048' | 'RSA3072' | 'RSA4096' | 'RSA8192'
}

export interface LocalOptions {
  provider: 'local'
  /** ACME certificate path */
  cert_path?: string
  /**  ACME key path */
  key_path?: string
}

export interface CustomOptions extends AutocertConfigBase {
  provider: 'custom'
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

export interface DeSECOptions extends AutocertConfigBase {
  provider: 'desec'
  options: {
    token: string
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
