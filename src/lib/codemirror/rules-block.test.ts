import { describe, expect, test } from 'bun:test'
import { CompletionContext } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { blockRulesCompletionSource } from './rules-block'

function completionAt(doc: string, pos = doc.length, explicit = true) {
  const state = EditorState.create({ doc })
  const context = new CompletionContext(state, pos, explicit)
  return blockRulesCompletionSource(context)
}

describe('blockRulesCompletionSource', () => {
  test('returns keyword candidates on explicit completion', () => {
    const result = completionAt('', 0, true)
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('header')
    expect(labels).toContain('proxy')
    expect(labels).toContain('default')
    expect(labels).toContain('regex')
  })

  test('uses current word boundaries for replacement', () => {
    const result = completionAt('hea')
    expect(result).not.toBeNull()
    expect(result?.from).toBe(0)
  })

  test('suggests log levels after log/notify', () => {
    const result = completionAt('log ')
    expect(result).not.toBeNull()

    const labels = result?.options.map(option => option.label) ?? []
    expect(labels).toContain('debug')
    expect(labels).toContain('info')
    expect(labels).toContain('warn')
    expect(labels).toContain('error')
    expect(labels).toContain('fatal')
  })

  test('suggests mutation fields after set/add/remove with field detail', () => {
    const result = completionAt('set ')
    expect(result).not.toBeNull()

    const header = result?.options.find(option => option.label === 'header')
    const respHeader = result?.options.find(option => option.label === 'resp_header')
    expect(header?.detail).toBe('field')
    expect(respHeader?.detail).toBe('field')
  })

  test('does not trigger implicitly without a word prefix', () => {
    const result = completionAt(' ', 1, false)
    expect(result).toBeNull()
  })
})
