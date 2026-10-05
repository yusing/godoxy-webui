import type { AutocertConfigWithoutExtra, AutocertExtra, AutocertProvider } from './autocert'

type Assert<T extends true> = T
type Common = { email: string; domains: string[] }

export type AutocertTypeChecks = [
  Assert<'spaceship' extends AutocertProvider ? true : false>,
  Assert<'rfc2136' extends AutocertProvider ? true : false>,
  Assert<string extends AutocertProvider ? false : true>,
  Assert<
    Extract<AutocertProvider, 'pseudo' | 'route53' | 'googledomains'> extends never ? true : false
  >,
  Assert<
    Common & {
      provider: 'spaceship'
      options: Record<string, string>
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
]
