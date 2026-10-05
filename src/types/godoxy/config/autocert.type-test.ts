import type {
  AutocertConfigWithoutExtra,
  AutocertExtra,
  AutocertProvider,
  SpaceshipOptions,
  OvhOptions,
  AcmednsOptions,
  AzurednsOptions,
} from './autocert'

type Assert<T extends true> = T
type Common = { email: string; domains: string[] }
type ConcreteOptions<T> = T extends { options?: infer O }
  ? keyof NonNullable<O> extends never
    ? false
    : string extends keyof NonNullable<O>
      ? false
      : true
  : true

export type AutocertTypeChecks = [
  Assert<ConcreteOptions<AutocertConfigWithoutExtra>>,
  Assert<'spaceship' extends AutocertProvider ? true : false>,
  Assert<'rfc2136' extends AutocertProvider ? true : false>,
  Assert<string extends AutocertProvider ? false : true>,
  Assert<
    Extract<AutocertProvider, 'pseudo' | 'route53' | 'googledomains'> extends never ? true : false
  >,
  Assert<
    Common & {
      provider: 'spaceship'
      options: { api_key: string; api_secret: string; ttl: number }
    } extends AutocertConfigWithoutExtra
      ? true
      : false
  >,
  Assert<
    Common & {
      provider: 'spaceship'
      options: { api_key: number }
    } extends AutocertConfigWithoutExtra
      ? false
      : true
  >,
  Assert<
    Common & {
      provider: 'cloudflare'
      options: { wrong_key: string }
    } extends AutocertConfigWithoutExtra
      ? false
      : true
  >,
  Assert<{ provider: 'unknown' } extends AutocertExtra ? false : true>,
  Assert<string extends keyof NonNullable<SpaceshipOptions['options']> ? false : true>,
  Assert<'auth_token' extends keyof NonNullable<SpaceshipOptions['options']> ? false : true>,
  Assert<
    NonNullable<SpaceshipOptions['options']>['api_key'] extends string | undefined ? true : false
  >,
  Assert<
    NonNullable<AcmednsOptions['options']>['allow_list'] extends string[] | undefined ? true : false
  >,
  Assert<
    NonNullable<NonNullable<OvhOptions['options']>['oauth2_config']>['client_id'] extends
      | string
      | undefined
      ? true
      : false
  >,
  Assert<
    NonNullable<NonNullable<AzurednsOptions['options']>['environment']>['services'] extends
      | { [key: string]: { audience?: string; endpoint?: string } }
      | undefined
      ? true
      : false
  >,
]
