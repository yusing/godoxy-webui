import type { DomainOrWildcard, Email } from '../types'
import type { AutocertConfigWithoutExtra, AutocertExtra } from './autocert-providers'
export type * from './autocert-providers'

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
   * Private key algorithm
   *
   * @default EC256
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
