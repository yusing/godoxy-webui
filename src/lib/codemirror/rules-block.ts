import { autocompletion, ifNotIn, type Completion, type CompletionSource } from '@codemirror/autocomplete'
import { LanguageSupport, StreamLanguage, type StringStream } from '@codemirror/language'

export function blockRules() {
  return new LanguageSupport(blockRulesLanguage, [
    autocompletion({
      override: [blockRulesCompletionSource],
    }),
  ])
}

const conditionKeywords = new Set([
  'header',
  'query',
  'cookie',
  'form',
  'postform',
  'post_form',
  'proto',
  'method',
  'host',
  'path',
  'remote',
  'route',
  'basic_auth',
  'status',
  'resp_header',
])

const actionKeywords = new Set([
  'upstream',
  'pass',
  'bypass',
  'require_auth',
  'rewrite',
  'serve',
  'proxy',
  'route',
  'redirect',
  'error',
  'require_basic_auth',
  'set',
  'add',
  'remove',
  'log',
  'notify',
])

const controlKeywords = new Set(['default', 'elif', 'else'])
const patternFunctions = new Set(['glob', 'regex'])
const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'CONNECT', 'HEAD', 'OPTIONS', 'TRACE']
const protocolAtoms = ['http', 'https', 'h1', 'h2', 'h2c', 'h3']
const logLevels = ['debug', 'info', 'warn', 'error', 'fatal']
const mutationActions = new Set(['set', 'add', 'remove'])
const mutationFieldKeywords = new Set([
  'header',
  'resp_header',
  'query',
  'cookie',
  'body',
  'resp_body',
  'status',
])

const blockRuleKeywordCompletions: Completion[] = [
  ...[...controlKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'control',
  })),
  ...[...conditionKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'condition',
  })),
  ...[...actionKeywords].map(label => ({
    label,
    type: 'keyword',
    detail: 'action',
  })),
  ...[...patternFunctions].map(label => ({
    label,
    type: 'function',
    detail: 'pattern',
  })),
  ...httpMethods.map(label => ({
    label,
    type: 'constant',
    detail: 'method',
  })),
  ...protocolAtoms.map(label => ({
    label,
    type: 'constant',
    detail: 'protocol',
  })),
]

const logLevelCompletions: Completion[] = logLevels.map(label => ({
  label,
  type: 'constant',
  detail: 'log level',
}))
const mutationFieldCompletions: Completion[] = [...mutationFieldKeywords].map(label => ({
  label,
  type: 'property',
  detail: 'field',
}))

const keywordWordRegex = /[A-Za-z_][A-Za-z0-9_-]*/

function createCompletionResult({
  from,
  options,
}: {
  from: number
  options: Completion[]
}) {
  return {
    from,
    options,
    validFor: /^[A-Za-z0-9_-]*$/,
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

      if (stream.match(/\$\{[A-Za-z_][A-Za-z0-9_]*\}/)) return 'keyword'
      if (stream.match(/\$[A-Za-z_][A-Za-z0-9_]*(?=\()/)) {
        state.expectVarCallArgs = true
        return 'keyword'
      }
      if (stream.match(/\$[A-Za-z_][A-Za-z0-9_]*/)) return 'keyword'

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

    if (stream.match(/\$\{[A-Za-z_][A-Za-z0-9_]*\}/)) return 'keyword'
    if (stream.match(/\$[A-Za-z_][A-Za-z0-9_]*(?=\()/)) {
      state.expectVarCallArgs = true
      return 'keyword'
    }
    if (stream.match(/\$[A-Za-z_][A-Za-z0-9_]*/)) return 'keyword'

    if (stream.match(/\d+(?:\.\d+)?(?:-\d+)?(?:xx)?\b/)) return 'number'

    if (stream.match(/[A-Za-z_][A-Za-z0-9_-]*/)) {
      const word = stream.current()
      if (state.expectMutationField) {
        state.expectMutationField = false
        if (mutationFieldKeywords.has(word)) return 'attributeName'
      }
      if (controlKeywords.has(word) || conditionKeywords.has(word) || actionKeywords.has(word)) {
        if (word === 'log' || word === 'notify') {
          state.expectLogLevel = true
        }
        if (mutationActions.has(word)) {
          state.expectMutationField = true
        }
        return 'keyword'
      }
      if (patternFunctions.has(word)) {
        state.expectPatternArgs = true
        return 'builtin'
      }
      if (httpMethods.includes(word)) return 'atom'
      if (protocolAtoms.includes(word)) return 'atom'
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
