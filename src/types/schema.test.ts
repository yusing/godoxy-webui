import { expect, test } from 'bun:test'
import { isToggleType, type JSONSchema } from './schema'

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
