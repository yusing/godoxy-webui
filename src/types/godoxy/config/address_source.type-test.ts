import type { ACLConfig, ACLMatcher } from './acl'
import type { RequestLogFilters } from './access_log'
import type { RuleOn } from './rules'
import type { CIDRWhitelist, RealIP } from '../middlewares/middlewares'
import type { CIDR } from '../types'

const sources = [
  '10.0.0.0/8',
  '203.0.113.7',
  '2001:db8::7',
  '::ffff:203.0.113.7',
  'host:home.example.',
] as const

export const whitelist = {
  use: 'cidr_whitelist',
  allow: [...sources],
  bypass: ['remote host:home.example.'],
} satisfies CIDRWhitelist & { bypass: RuleOn[] }

export const realIP = { use: 'real_ip', from: [...sources] } satisfies RealIP
export const filters = { cidr: { values: [...sources] } } satisfies RequestLogFilters
export const acl = {
  allow: ['host:home.example'],
  deny: ['host:blocked.example.'],
} satisfies ACLConfig

// Hostname sources belong only to supported filters, not static CIDR matchers.
// @ts-expect-error A hostname is not a static CIDR.
export const cidr: CIDR = 'host:home.example'
// @ts-expect-error The ACL requires its separate host: matcher.
export const matcher: ACLMatcher = 'cidr:host:home.example'
