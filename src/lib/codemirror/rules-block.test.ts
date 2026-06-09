import { describe, expect, test } from 'bun:test'
import { CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { blockRules, blockRulesCompletionSource } from './rules-block'

function completionAt(doc: string, pos = doc.length, explicit = true) {
  const state = EditorState.create({ doc })
  const context = new CompletionContext(state, pos, explicit)
  return blockRulesCompletionSource(context)
}

function findTokenNames(doc: string, targetText: string) {
  const state = EditorState.create({ doc, extensions: [blockRules()] })
  const tree = syntaxTree(state)
  const names: string[] = []
  const cursor = tree.cursor()
  do {
    if (doc.slice(cursor.from, cursor.to) === targetText) {
      names.push(cursor.name)
    }
  } while (cursor.next())
  return names
}

describe('blockRulesCompletionSource', () => {
  test('returns keyword candidates on explicit completion', async () => {
    const result = await completionAt('', 0, true)
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('header')
    expect(labels).toContain('proxy')
    expect(labels).toContain('default')
    expect(labels).toContain('regex')
  })

  test('uses current word boundaries for replacement', async () => {
    const result = await completionAt('hea')
    expect(result).not.toBeNull()
    expect(result?.from).toBe(0)
  })

  test('suggests log levels after log/notify', async () => {
    const result = await completionAt('log ')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('debug')
    expect(labels).toContain('info')
    expect(labels).toContain('warn')
    expect(labels).toContain('error')
    expect(labels).toContain('fatal')
  })

  test('suggests mutation fields after set/add/remove with field detail', async () => {
    const result = await completionAt('set ')
    expect(result).not.toBeNull()

    const header = result?.options.find(option => option.label === 'header')
    const respHeader = result?.options.find(option => option.label === 'resp_header')
    expect(header?.detail).toBe('field')
    expect(respHeader?.detail).toBe('field')
  })

  test('suggests static and dynamic variables when completing after $', async () => {
    const result = await completionAt('$req_')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('$req_method')
    expect(labels).toContain('$status_code')
    expect(labels).toContain('$header')
    expect(labels).toContain('$redacted')
  })

  test('suggests command option names inside named option blocks', async () => {
    const result = await completionAt('path /api {\n  rewrite {\n    ')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('from')
    expect(labels).toContain('to')
    expect(labels).not.toContain('provider')
    expect(result?.options.find(option => option.label === 'from')?.apply).toBe('from: ')
  })

  test('omits option names already set in named option blocks', async () => {
    const result = await completionAt('path /api {\n  notify {\n    level: info\n    ')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).not.toContain('level')
    expect(labels).toContain('provider')
    expect(labels).toContain('title')
    expect(labels).toContain('body')
  })

  test('suggests remaining option names after inline option values', async () => {
    const rewrite = await completionAt('path /api {\n  rewrite { from: /api ')
    const rewriteLabels = rewrite?.options.map(option => option.label) ?? []
    expect(rewriteLabels).not.toContain('from')
    expect(rewriteLabels).toContain('to')
    expect(rewriteLabels).not.toContain('provider')
    expect(rewriteLabels).not.toContain('header')

    const notify = await completionAt('path /api {\n  notify { level: info ')
    const notifyLabels = notify?.options.map(option => option.label) ?? []
    expect(notifyLabels).not.toContain('level')
    expect(notifyLabels).toContain('provider')
    expect(notifyLabels).toContain('title')
    expect(notifyLabels).toContain('body')
  })

  test('suggests option values for named option block fields', async () => {
    const result = await completionAt('path /api {\n  notify {\n    level: ')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('info')
    expect(labels).toContain('error')
  })

  test('does not trigger implicitly without a word prefix', async () => {
    const result = await completionAt(' ', 1, false)
    expect(result).toBeNull()
  })
})

describe('blockRulesLanguage variable highlighting', () => {
  test('highlights static and dynamic variables in strings', () => {
    const doc =
      'log info /dev/stdout "$req_method $header(User-Agent) $redacted($header(Authorization))"'

    expect(findTokenNames(doc, '$req_method')).toContain('variableName')
    expect(findTokenNames(doc, '$header')).toContain('variableName.standard')
    expect(findTokenNames(doc, '$redacted')).toContain('variableName.standard')
  })

  test('highlights named option block keys and values', () => {
    const doc = `path /api {
  rewrite {
    from: /api
    to: /backend
  }

  notify {
    level: info
    provider: ntfy
    title: API request
    body: "$req_method $req_url $status_code"
  }
}`

    expect(findTokenNames(doc, 'from')).toContain('propertyName')
    expect(findTokenNames(doc, 'to')).toContain('propertyName')
    expect(findTokenNames(doc, 'level')).toContain('propertyName')
    expect(findTokenNames(doc, 'info')).toContain('typeName')
    expect(findTokenNames(doc, '$req_method')).toContain('variableName')
    expect(findTokenNames(doc, '$status_code')).toContain('variableName')
  })

  test('highlights inline option block keys', () => {
    const doc = 'path /api { rewrite { from: /api to: /backend } }'

    expect(findTokenNames(doc, 'from')).toContain('propertyName')
    expect(findTokenNames(doc, 'to')).toContain('propertyName')
  })

  test('does not highlight options from another command as valid keys', () => {
    expect(findTokenNames('path /api { rewrite { provider: ntfy } }', 'provider')).not.toContain(
      'propertyName'
    )
    expect(findTokenNames('path /api { notify { provider: ntfy } }', 'provider')).toContain(
      'propertyName'
    )
  })
})
