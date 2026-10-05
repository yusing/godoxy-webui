import { describe, expect, test } from 'bun:test'
import { compileSchema, draft04 } from 'json-schema-library'
import configSchema from './config.schema.json'
import dockerSchema from './docker_routes.schema.json'
import routesSchema from './routes.schema.json'
import type { ReverseProxyRoute } from './providers/routes'

// Match the config editor's schema validation, including its draft selection.
const config = compileSchema(configSchema, { drafts: [draft04] })
const routes = compileSchema(routesSchema, { drafts: [draft04] })
const docker = compileSchema(dockerSchema, { drafts: [draft04] })

// Retain the existing required fields and numeric TimeDuration representation.
const idlewatcher = {
  depends_on: [],
  idle_timeout: 60_000_000_000,
  no_loading_page: false,
  start_endpoint: '',
  stop_method: 'stop',
  stop_signal: 'SIGTERM',
  stop_timeout: 1_000_000_000,
  wake_timeout: 1_000_000_000,
} satisfies NonNullable<ReverseProxyRoute['idlewatcher']>

const notifications = [
  ['enabled only', { enabled: true }],
  ['recipients only', { to: ['discord'] }],
  ['explicit opt-out', { enabled: false }],
] as const

const invalidNotifications = [
  ['non-object notify', false],
  ['non-boolean enabled', { enabled: 'false' }],
  ['non-array recipients', { to: 'discord' }],
  ['non-string recipient', { to: [123] }],
  ['unknown notification field', { enabled: true, unknown: true }],
] as const

describe('global idle notification defaults', () => {
  test.each(notifications)('accepts %s', (_, notify) => {
    const result = config.validate({ providers: {}, defaults: { idlewatcher: { notify } } })
    expect(result.errors).toEqual([])
  })

  test.each(invalidNotifications)('rejects %s', (_, notify) => {
    expect(config.validate({ providers: {}, defaults: { idlewatcher: { notify } } }).valid).toBe(
      false
    )
  })
})

for (const scheme of ['http', 'tcp'] as const) {
  describe(`${scheme} route idle notifications`, () => {
    test('accepts the existing route without notify', () => {
      expect(routes.validate({ app: { scheme, idlewatcher } }).errors).toEqual([])
    })

    test.each(notifications)('accepts %s', (_, notify) => {
      expect(
        routes.validate({ app: { scheme, idlewatcher: { ...idlewatcher, notify } } }).errors
      ).toEqual([])
    })

    test.each(invalidNotifications)('rejects %s', (_, notify) => {
      expect(
        routes.validate({ app: { scheme, idlewatcher: { ...idlewatcher, notify } } }).valid
      ).toBe(false)
    })
  })
}

describe('Docker idle notification labels', () => {
  test.each([
    ['enabled only', { idle_notify: true }],
    ['recipients only', { idle_notify_to: 'discord,email' }],
    ['explicit opt-out with recipients', { idle_notify: false, idle_notify_to: 'discord' }],
  ])('accepts %s', (_, labels) => {
    expect(docker.validate({ app: { scheme: 'http', ...labels } }).errors).toEqual([])
  })

  test.each([
    ['non-boolean enabled', { idle_notify: 'false' }],
    ['non-string recipients', { idle_notify_to: ['discord'] }],
    ['unknown notification field', { idle_notify_unknown: true }],
  ])('rejects %s', (_, labels) => {
    expect(docker.validate({ app: { scheme: 'http', ...labels } }).valid).toBe(false)
  })
})
