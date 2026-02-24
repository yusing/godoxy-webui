import {
  autocompletion,
  type Completion,
  type CompletionSource,
  ifNotIn,
} from '@codemirror/autocomplete'
import { LanguageSupport, StreamLanguage, type StringStream } from '@codemirror/language'
import * as common from './rules-block-common'

export function blockRules() {
  return new LanguageSupport(blockRulesLanguage, [
    autocompletion({
      override: [blockRulesCompletionSource],
    }),
  ])
}

const blockRuleKeywordCompletions: Completion[] = [
  ...[...common.controlKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'control',
  })),
  ...[...common.conditionKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'condition',
  })),
  ...[...common.actionKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'action',
  })),
  ...[...common.patternFunctions].map(label => ({
    label,
    type: 'function',
    detail: 'pattern',
  })),
  ...common.httpMethods.map(label => ({
    label,
    type: 'constant',
    detail: 'method',
  })),
  ...common.protocolAtoms.map(label => ({
    label,
    type: 'constant',
    detail: 'protocol',
  })),
  ...common.staticVariables.map(label => ({
    label: `$${label}`,
    type: 'variable',
    detail: 'variable',
  })),
  ...common.dynamicVariableFunctions.map(label => ({
    label: `$${label}`,
    type: 'function',
    detail: 'dynamic variable',
  })),
]

const logLevelCompletions: Completion[] = common.logLevels.map(label => ({
  label,
  type: 'constant',
  detail: 'log level',
}))
const mutationFieldCompletions: Completion[] = [...common.mutationFieldKeywords].map(label => ({
  label,
  type: 'property',
  detail: 'field',
}))

const keywordWordRegex = /\$?[A-Za-z_][A-Za-z0-9_-]*/

function tokenizeVariableReference(stream: StringStream, state: BlockRulesState) {
  if (stream.match(/\$\{[A-Za-z_][A-Za-z0-9_]*\}/)) return 'variableName'

  const variableMatch = stream.match(/\$([A-Za-z_][A-Za-z0-9_]*)/)
  if (!variableMatch) return null

  if (stream.match('(', false)) {
    state.expectVarCallArgs = true
    return 'builtin'
  }

  return 'variableName'
}

function createCompletionResult({ from, options }: { from: number; options: Completion[] }) {
  return {
    from,
    options,
    validFor: /^\$?[A-Za-z0-9_-]*$/,
  }
}

export const blockRulesCompletionSource: CompletionSource = ifNotIn(
  ['LineComment', 'BlockComment', 'Comment', 'String'],
  context => {
    const line = context.state.doc.lineAt(context.pos)
    const linePrefix = context.state.sliceDoc(line.from, context.pos)
    const word = context.matchBefore(keywordWordRegex)
    const from = word?.from ?? context.pos

    if (/\b(?:log|notify)\s+[A-Za-z_-]*$/.test(linePrefix)) {
      return createCompletionResult({ from, options: logLevelCompletions })
    }
    if (/\b(?:set|add|remove)\s+[A-Za-z_-]*$/.test(linePrefix)) {
      return createCompletionResult({ from, options: mutationFieldCompletions })
    }

    if (!word && !context.explicit) return null

    return createCompletionResult({ from, options: blockRuleKeywordCompletions })
  }
)

type BlockRulesState = {
  expectLogLevel: boolean
  expectMutationField: boolean
  expectPatternArgs: boolean
  expectVarCallArgs: boolean
  inBlockComment: boolean
  inString: '"' | "'" | null
  patternArgsDepth: number
  varCallArgsDepth: number
}

function tokenVarCallArgs(stream: StringStream, state: BlockRulesState) {
  if (stream.eatSpace()) return null
  if (stream.match('(')) {
    state.varCallArgsDepth += 1
    return 'punctuation'
  }
  if (stream.match(')')) {
    state.varCallArgsDepth -= 1
    return 'punctuation'
  }
  if (stream.match(',')) return 'separator'
  if (stream.match(/\d+\b/)) return 'number'

  const variableToken = tokenizeVariableReference(stream, state)
  if (variableToken) return variableToken

  if (stream.match(/[A-Za-z_][A-Za-z0-9_.:/-]*/)) return 'attributeName'

  const quote = stream.peek()
  if (quote === '"' || quote === "'") {
    stream.next()
    let escaped = false
    while (!stream.eol()) {
      const ch = stream.next()
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === quote) break
    }
    return 'string'
  }

  stream.next()
  return null
}

function tokenPatternArgs(stream: StringStream, state: BlockRulesState) {
  if (stream.match('(')) {
    state.patternArgsDepth += 1
    return 'punctuation'
  }
  if (stream.match(')')) {
    state.patternArgsDepth -= 1
    return 'punctuation'
  }

  const quote = stream.peek()
  if (quote === '"' || quote === "'") {
    stream.next()
    let escaped = false
    while (!stream.eol()) {
      const ch = stream.next()
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === quote) break
    }
    return 'string'
  }

  if (stream.match(/[^()]+/)) return 'string'
  stream.next()
  return 'string'
}

function isCommentBoundary(stream: StringStream) {
  if (stream.pos === 0) return true
  const prev = stream.string.charAt(stream.pos - 1)
  return /\s/.test(prev)
}

export const blockRulesLanguage = StreamLanguage.define({
  startState() {
    return {
      expectLogLevel: false,
      expectMutationField: false,
      expectPatternArgs: false,
      expectVarCallArgs: false,
      inBlockComment: false,
      inString: null,
      patternArgsDepth: 0,
      varCallArgsDepth: 0,
    } satisfies BlockRulesState
  },
  token(stream, state: BlockRulesState) {
    if (stream.sol()) {
      state.expectLogLevel = false
      state.expectMutationField = false
    }

    if (state.inBlockComment) {
      if (stream.skipTo('*/')) {
        stream.match('*/')
        state.inBlockComment = false
      } else {
        stream.skipToEnd()
      }
      return 'comment'
    }

    if (state.varCallArgsDepth > 0) {
      return tokenVarCallArgs(stream, state)
    }

    if (state.patternArgsDepth > 0) {
      return tokenPatternArgs(stream, state)
    }

    if (state.inString) {
      if (state.expectVarCallArgs && stream.match('(')) {
        state.expectVarCallArgs = false
        state.varCallArgsDepth = 1
        return 'punctuation'
      }

      if (stream.peek() === state.inString) {
        stream.next()
        state.inString = null
        return 'string'
      }

      const variableToken = tokenizeVariableReference(stream, state)
      if (variableToken) return variableToken

      let escaped = false
      while (!stream.eol()) {
        const ch = stream.peek()
        if (!escaped && (ch === state.inString || ch === '$')) break
        stream.next()
        escaped = !escaped && ch === '\\'
      }
      return 'string'
    }

    if (stream.eatSpace()) return null

    if (stream.match('//', false)) {
      const prev = stream.pos > 0 ? stream.string.charAt(stream.pos - 1) : ''
      if (prev !== ':') {
        stream.match('//')
        stream.skipToEnd()
        return 'comment'
      }
    }

    if (stream.match('#', false)) {
      const prev = stream.pos > 0 ? stream.string.charAt(stream.pos - 1) : ''
      if (!prev || /\s/.test(prev)) {
        stream.match('#')
        stream.skipToEnd()
        return 'comment'
      }
    }

    if (stream.match('/*', false) && isCommentBoundary(stream)) {
      stream.match('/*')
      state.inBlockComment = true
      return 'comment'
    }

    const quote = stream.peek()
    if (quote === '"' || quote === "'") {
      stream.next()
      state.inString = quote
      return 'string'
    }

    if (state.expectVarCallArgs && stream.match('(')) {
      state.expectVarCallArgs = false
      state.varCallArgsDepth = 1
      return 'punctuation'
    }

    if (state.expectPatternArgs && stream.match('(')) {
      state.expectPatternArgs = false
      state.patternArgsDepth = 1
      return 'punctuation'
    }

    if (state.expectLogLevel && stream.match(/[A-Za-z_][A-Za-z0-9_-]*/)) {
      state.expectLogLevel = false
      return 'typeName'
    }

    if (stream.match(/[{}]/)) return 'brace'
    if (stream.match(/[()]/)) return 'punctuation'
    if (stream.match(/[&|]/)) return 'operator'

    const variableToken = tokenizeVariableReference(stream, state)
    if (variableToken) return variableToken

    if (stream.match(/\d+(?:\.\d+)?(?:-\d+)?(?:xx)?\b/)) return 'number'

    if (stream.match(/[A-Za-z_][A-Za-z0-9_-]*/)) {
      const word = stream.current()
      if (state.expectMutationField) {
        state.expectMutationField = false
        if (common.mutationFieldKeywords.has(word)) return 'attributeName'
      }
      if (
        common.controlKeywords.has(word) ||
        common.conditionKeywords.has(word) ||
        common.actionKeywords.has(word)
      ) {
        if (word === 'log' || word === 'notify') {
          state.expectLogLevel = true
        }
        if (common.mutationActions.has(word)) {
          state.expectMutationField = true
        }
        return 'keyword'
      }
      if (common.patternFunctions.has(word)) {
        state.expectPatternArgs = true
        return 'builtin'
      }
      if (common.httpMethods.includes(word)) return 'atom'
      if (common.protocolAtoms.includes(word)) return 'atom'
      return null
    }

    stream.next()
    return null
  },
  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    indentOnInput: /^\s*(?:\{|\})$/,
  },
})
