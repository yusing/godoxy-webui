import { expect, test } from 'bun:test'
import { resolveDocHref } from './links'

test.each([
  [
    './Certificates',
    'godoxy/advanced-topics/HTTPS.mdx',
    '/docs/godoxy/advanced-topics/Certificates',
  ],
  [
    './Conditions#basic-authentication',
    'godoxy/advanced-topics/Rules/index.mdx',
    '/docs/godoxy/advanced-topics/Rules/Conditions#basic-authentication',
  ],
  [
    '../../Access-Control#request-level',
    'godoxy/advanced-topics/middlewares/access-control/CIDR-Whitelist.mdx',
    '/docs/godoxy/advanced-topics/Access-Control#request-level',
  ],
  [
    '../index.mdx?mode=full#examples',
    'godoxy/advanced-topics/Rules/Conditions.mdx',
    '/docs/godoxy/advanced-topics?mode=full#examples',
  ],
])('resolves %s relative to the MDX source', (href, source, expected) => {
  expect(resolveDocHref(href, source)).toBe(expected)
})

test.each([
  'https://example.com/../guide',
  '//example.com/guide',
  '/docs/godoxy/guide',
  '#examples',
  'mailto:hello@example.com',
])('preserves %s', href => {
  expect(resolveDocHref(href, 'godoxy/guide/index.mdx')).toBe(href)
})
