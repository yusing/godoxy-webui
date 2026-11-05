import { expect, test } from 'bun:test'
import { compileSchema, draft04 } from 'json-schema-library'
import configSchema from './config.schema.json'
import aclSchema from './acl.schema.json'
import composeSchema from './middleware_compose.schema.json'
import routesSchema from './routes.schema.json'
import type { Config, AddressSetEntry } from './config/config'
import type { ACLMatcher } from './config/acl'
import type { AddressSource } from './types'

const config = compileSchema(configSchema, { drafts: [draft04] })
const acl = compileSchema(aclSchema, { drafts: [draft04] })
const compose = compileSchema(composeSchema, { drafts: [draft04] })
const routes = compileSchema(routesSchema, { drafts: [draft04] })

const candidate = {
  providers: {},
  address_sets: { family: ['203.0.113.0/24', 'host:home.example.com'] },
  acl: { allow: ['set:family'], deny: ['host:blocked.example.com'] },
  entrypoint: { middlewares: [{ use: 'cidr_whitelist', allow: ['set:family'] }] },
} satisfies Config

test('root schema accepts address definitions and their consumers', () => {
  expect(config.validate(candidate).errors).toEqual([])
  expect(acl.validate(candidate.acl).errors).toEqual([])
  expect(compose.validate({ guard: candidate.entrypoint.middlewares }).errors).toEqual([])
  expect(
    routes.validate({
      app: { scheme: 'http', middlewares: { cidr_whitelist: { allow: ['set:family'] } } },
    }).errors
  ).toEqual([])
})

test.each([null, '', {}, 'set:other'])('set entries reject %j', entry => {
  expect(config.validate({ providers: {}, address_sets: { family: [entry] } }).valid).toBe(false)
})

type Assert<T extends true> = T
export type AddressSetTypeChecks = [
  Assert<'set:family' extends AddressSource ? true : false>,
  Assert<'set:family' extends ACLMatcher ? true : false>,
  Assert<'set:family' extends AddressSetEntry ? false : true>,
  Assert<'host:home.example.com' extends AddressSetEntry ? true : false>,
]
