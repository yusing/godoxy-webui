import { expect, test } from 'bun:test'
import { compileSchema, draft04 } from 'json-schema-library'
import { ConfigSchema, DockerRoutesSchema, RoutesSchema } from '.'
import type { RequestLogFilters } from './config/access_log'

const filters = {
  status_codes: { values: ['200-299', 503], negative: true },
  method: { values: ['GET'] },
} satisfies RequestLogFilters

for (const { name, schema, candidate } of [
  {
    name: 'root config',
    schema: ConfigSchema,
    candidate: (filters: unknown) => ({
      providers: {},
      entrypoint: { access_log: { filters } },
    }),
  },
  {
    name: 'route config',
    schema: RoutesSchema,
    candidate: (filters: unknown) => ({ app: { scheme: 'http', access_log: { filters } } }),
  },
  {
    name: 'Docker route config',
    schema: DockerRoutesSchema,
    candidate: (filters: unknown) => ({ app: { scheme: 'http', access_log: { filters } } }),
  },
]) {
  const compiled = compileSchema(schema, { drafts: [draft04] })

  test(`${name} accepts backend status-code filters`, () => {
    expect(compiled.validate(candidate(filters)).errors).toEqual([])
    expect(compiled.validate(candidate({ method: filters.method })).errors).toEqual([])
  })

  test(`${name} rejects the unsupported singular status-code filter`, () => {
    expect(compiled.validate(candidate({ status_code: filters.status_codes })).valid).toBe(false)
  })
}
