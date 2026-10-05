import { expect, test } from 'bun:test'
import { getTitle, isToggleType, type JSONSchema } from './schema'

test('boolean and string-boolean unions use toggle controls', () => {
  const booleanSchema: JSONSchema = {
    anyOf: [
      { type: 'boolean' },
      { type: 'string', const: 'true' },
      { type: 'string', const: 'false' },
    ],
  }
  expect(isToggleType(booleanSchema)).toBe(true)
  expect(isToggleType({ type: 'boolean' })).toBe(true)
  expect(isToggleType({ type: ['boolean', 'null'] })).toBe(true)
})

test('unrestricted mixed primitives and string enums keep their controls', () => {
  expect(isToggleType({ type: ['string', 'number', 'boolean'] })).toBe(false)
  expect(isToggleType({ anyOf: [{ type: 'boolean' }, { type: 'string' }] })).toBe(false)
  expect(isToggleType({ anyOf: [{ type: 'boolean' }, { type: 'number' }] })).toBe(false)
  expect(isToggleType({ type: 'string', enum: ['true', 'false'] })).toBe(false)
  expect(isToggleType({ type: 'string', enum: ['cloudflare', 'azuredns'] })).toBe(false)
  expect(isToggleType(undefined)).toBe(false)
})

test('inferred field labels use PascalCase without changing explicit titles', () => {
  const schema: JSONSchema = {
    properties: {
      client_secret: { type: 'string' },
      oidc_request_url: { type: 'string' },
      zone_name: { type: 'string', title: 'DNS zone name' },
      propagation_timeout: { type: 'string', description: 'Go duration, for example 30s.' },
    },
  }
  expect(getTitle(schema, 'client_secret')).toBe('ClientSecret')
  expect(getTitle(schema, 'oidc_request_url')).toBe('OidcRequestUrl')
  expect(getTitle(schema, 'zone_name')).toBe('DNS zone name')
  expect(getTitle(schema, 'propagation_timeout')).toBe('Go duration, for example 30s.')
  expect(getTitle(schema, 'unknown_key')).toBeUndefined()
})
