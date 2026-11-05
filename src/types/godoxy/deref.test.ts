import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const script = join(import.meta.dir, 'deref.ts')

function withSchemaFiles(check: (input: string, output: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'godoxy-deref-'))
  try {
    check(join(directory, 'schema.json'), join(directory, 'schema.deref.json'))
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('schema dereferencing writes resolved references before succeeding', () => {
  withSchemaFiles((input, output) => {
    const definition = { type: 'string' }
    writeFileSync(
      input,
      JSON.stringify({
        definitions: { message: definition },
        properties: { message: { $ref: '#/definitions/message' } },
      })
    )
    const result = Bun.spawnSync([process.execPath, script, input])
    expect(result.exitCode).toBe(0)
    expect(result.stderr.toString()).toBe('')
    expect(JSON.parse(readFileSync(output, 'utf8'))).toEqual({
      definitions: { message: definition },
      properties: { message: definition },
    })
  })
})

test('schema dereferencing failures preserve prior output and return failure', () => {
  withSchemaFiles((input, output) => {
    writeFileSync(input, JSON.stringify({ $ref: '#/definitions/missing' }))
    writeFileSync(output, 'previous schema')
    const result = Bun.spawnSync([process.execPath, script, input])
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).not.toBe('')
    expect(readFileSync(output, 'utf8')).toBe('previous schema')
  })
})

test('schema output write failures return failure', () => {
  withSchemaFiles((input, output) => {
    writeFileSync(input, JSON.stringify({ type: 'string' }))
    mkdirSync(output)
    const result = Bun.spawnSync([process.execPath, script, input])
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).not.toBe('')
  })
})
