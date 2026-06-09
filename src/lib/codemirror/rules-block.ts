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
const commandOptionCompletions = new Map<string, Completion[]>(
  [...common.commandOptionFields].map(([command, fields]) => [
    command,
    fields.map(field => ({
      label: field.name,
      apply: `${field.name}: `,
      type: 'property',
      detail: field.description,
    })),
  ])
)

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

function getCommandOptionCompletions(command: string, usedFields: Set<string>) {
  return (commandOptionCompletions.get(command) ?? []).filter(
    option => !usedFields.has(option.label)
  )
}

function commandHasOption(command: string, field: string) {
  return common.commandOptionFields.get(command)?.some(option => option.name === field) ?? false
}

type OptionBlockContext = {
  command: string
  from: number
}

function commandFromBlockHeader(header: string) {
  const command = header.trim()
  if (!common.actionKeywords.has(command)) return null
  if (!common.commandOptionFields.has(command)) return null
  return command
}

function findOptionBlockContext(doc: string, pos: number): OptionBlockContext | null {
  const stack: OptionBlockContext[] = []
  let lineStart = 0
  let quote: '"' | "'" | '`' | null = null
  let escaped = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < pos; i += 1) {
    const ch = doc[i]
    const next = doc[i + 1]

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        lineStart = i + 1
      }
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i += 1
      }
      if (ch === '\n') lineStart = i + 1
      continue
    }

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === quote) quote = null
      if (ch === '\n') lineStart = i + 1
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }

    if (ch === '/' && next === '/') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (prev !== ':') {
        inLineComment = true
        i += 1
        continue
      }
    }

    if (ch === '#') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (!prev || /\s/.test(prev)) {
        inLineComment = true
        continue
      }
    }

    if (ch === '/' && next === '*') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (!prev || /\s/.test(prev)) {
        inBlockComment = true
        i += 1
        continue
      }
    }

    if (ch === '$' && next === '{') {
      i += 2
      while (i < pos && doc[i] !== '}') i += 1
      continue
    }

    if (ch === '\n') {
      lineStart = i + 1
      continue
    }

    if (ch === '{') {
      const command = commandFromBlockHeader(doc.slice(lineStart, i))
      stack.push({ command: command ?? '', from: i + 1 })
      continue
    }

    if (ch === '}') {
      stack.pop()
    }
  }

  const current = stack.at(-1)
  if (!current?.command) return null
  return current
}

type OptionFieldUse = {
  name: string
  colon: number
}

function optionFieldUses(doc: string, from: number, to: number) {
  const uses: OptionFieldUse[] = []
  let quote: '"' | "'" | '`' | null = null
  let escaped = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = from; i < to; i += 1) {
    const ch = doc[i]
    const next = doc[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i += 1
      }
      continue
    }

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === quote) quote = null
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }

    if (ch === '/' && next === '/') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (prev !== ':') {
        inLineComment = true
        i += 1
        continue
      }
    }

    if (ch === '#') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (!prev || /\s/.test(prev)) {
        inLineComment = true
        continue
      }
    }

    if (ch === '/' && next === '*') {
      const prev = i > 0 ? doc[i - 1] : ''
      if (!prev || /\s/.test(prev)) {
        inBlockComment = true
        i += 1
        continue
      }
    }

    if (!/[A-Za-z_]/.test(ch ?? '')) continue

    const nameStart = i
    i += 1
    while (i < to && /[A-Za-z0-9_-]/.test(doc[i] ?? '')) i += 1
    const name = doc.slice(nameStart, i)
    let colon = i
    while (colon < to && /\s/.test(doc[colon] ?? '')) colon += 1
    if (doc[colon] === ':') {
      uses.push({ name, colon })
      i = colon
    } else {
      i -= 1
    }
  }

  return uses
}

function isCompletingOptionKey(doc: string, pos: number, lastUse: OptionFieldUse | undefined) {
  if (!lastUse) return true

  const word = doc.slice(lastUse.colon + 1, pos)
  const beforeCurrentWord = word.replace(/[A-Za-z_][A-Za-z0-9_-]*$/, '')
  if (beforeCurrentWord.trim() === '') return false
  return /\s$/.test(beforeCurrentWord)
}

function completionForOptionBlock(context: Parameters<CompletionSource>[0]) {
  const doc = context.state.doc.toString()
  const optionBlock = findOptionBlockContext(doc, context.pos)
  if (!optionBlock) return null

  const word = context.matchBefore(keywordWordRegex)
  const from = word?.from ?? context.pos
  const uses = optionFieldUses(doc, optionBlock.from, context.pos)
  const usedFields = new Set(
    uses.map(use => use.name).filter(name => commandHasOption(optionBlock.command, name))
  )
  const lastUse = uses.at(-1)

  if (isCompletingOptionKey(doc, context.pos, lastUse)) {
    if (!word && !context.explicit) return null
    return createCompletionResult({
      from,
      options: getCommandOptionCompletions(optionBlock.command, usedFields),
    })
  }

  const optionName = lastUse?.name ?? ''
  if (optionName === 'level') {
    return createCompletionResult({ from, options: logLevelCompletions })
  }
  if (optionName === 'target') {
    return createCompletionResult({ from, options: mutationFieldCompletions })
  }
  if (word?.text.startsWith('$')) {
    return createCompletionResult({
      from,
      options: blockRuleKeywordCompletions.filter(option => option.label.startsWith('$')),
    })
  }

  if (!word && !context.explicit) return null
  return null
}

export const blockRulesCompletionSource: CompletionSource = ifNotIn(
  ['LineComment', 'BlockComment', 'Comment', 'String'],
  context => {
    const optionBlockResult = completionForOptionBlock(context)
    if (optionBlockResult) return optionBlockResult

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
  optionBlockStack: string[]
  optionLineKey: string | null
  patternArgsDepth: number
  pendingOptionBlockCommand: string | null
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

function currentOptionBlockCommand(state: BlockRulesState) {
  return state.optionBlockStack.at(-1) ?? null
}

function tokenOptionBlock(stream: StringStream, state: BlockRulesState) {
  if (stream.eatSpace()) return null

  if (stream.match('}')) {
    state.optionBlockStack.pop()
    state.optionLineKey = null
    return 'brace'
  }

  if (stream.match(':')) return 'punctuation'

  const quote = stream.peek()
  if (quote === '"' || quote === "'") {
    stream.next()
    state.inString = quote
    return 'string'
  }

  const variableToken = tokenizeVariableReference(stream, state)
  if (variableToken) return variableToken

  if (stream.match(/\d+(?:\.\d+)?(?:-\d+)?(?:xx)?\b/)) return 'number'

  if (stream.match(/[A-Za-z_][A-Za-z0-9_-]*/)) {
    const word = stream.current()
    if (stream.match(/^\s*:/, false)) {
      state.optionLineKey = word
      const command = currentOptionBlockCommand(state)
      if (command && commandHasOption(command, word)) return 'property'
      return null
    }

    if (state.optionLineKey === 'level' && common.logLevels.includes(word)) return 'typeName'
    if (state.optionLineKey === 'target' && common.mutationFieldKeywords.has(word)) {
      return 'attributeName'
    }
    if (common.httpMethods.includes(word)) return 'atom'
    if (common.protocolAtoms.includes(word)) return 'atom'
    return null
  }

  stream.next()
  return null
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
      optionBlockStack: [],
      optionLineKey: null,
      patternArgsDepth: 0,
      pendingOptionBlockCommand: null,
      varCallArgsDepth: 0,
    } satisfies BlockRulesState
  },
  token(stream, state: BlockRulesState) {
    if (stream.sol()) {
      state.expectLogLevel = false
      state.expectMutationField = false
      state.optionLineKey = null
      state.pendingOptionBlockCommand = null
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
        state.pendingOptionBlockCommand = null
        return 'comment'
      }
    }

    if (stream.match('#', false)) {
      const prev = stream.pos > 0 ? stream.string.charAt(stream.pos - 1) : ''
      if (!prev || /\s/.test(prev)) {
        stream.match('#')
        stream.skipToEnd()
        state.pendingOptionBlockCommand = null
        return 'comment'
      }
    }

    if (stream.match('/*', false) && isCommentBoundary(stream)) {
      stream.match('/*')
      state.inBlockComment = true
      state.pendingOptionBlockCommand = null
      return 'comment'
    }

    const quote = stream.peek()
    if (quote === '"' || quote === "'") {
      stream.next()
      state.inString = quote
      state.pendingOptionBlockCommand = null
      return 'string'
    }

    if (currentOptionBlockCommand(state)) {
      return tokenOptionBlock(stream, state)
    }

    if (state.expectVarCallArgs && stream.match('(')) {
      state.expectVarCallArgs = false
      state.pendingOptionBlockCommand = null
      state.varCallArgsDepth = 1
      return 'punctuation'
    }

    if (state.expectPatternArgs && stream.match('(')) {
      state.expectPatternArgs = false
      state.pendingOptionBlockCommand = null
      state.patternArgsDepth = 1
      return 'punctuation'
    }

    if (state.expectLogLevel && stream.match(/[A-Za-z_][A-Za-z0-9_-]*/)) {
      state.expectLogLevel = false
      state.pendingOptionBlockCommand = null
      return 'typeName'
    }

    if (stream.match('{')) {
      if (state.pendingOptionBlockCommand) {
        state.optionBlockStack.push(state.pendingOptionBlockCommand)
      }
      state.pendingOptionBlockCommand = null
      return 'brace'
    }
    if (stream.match('}')) {
      state.optionBlockStack.pop()
      state.pendingOptionBlockCommand = null
      return 'brace'
    }
    if (stream.match(/[()]/)) {
      state.pendingOptionBlockCommand = null
      return 'punctuation'
    }
    if (stream.match(/[&|]/)) {
      state.pendingOptionBlockCommand = null
      return 'operator'
    }

    const variableToken = tokenizeVariableReference(stream, state)
    if (variableToken) {
      state.pendingOptionBlockCommand = null
      return variableToken
    }

    if (stream.match(/\d+(?:\.\d+)?(?:-\d+)?(?:xx)?\b/)) {
      state.pendingOptionBlockCommand = null
      return 'number'
    }

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
        state.pendingOptionBlockCommand = common.commandOptionFields.has(word) ? word : null
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
        state.pendingOptionBlockCommand = null
        return 'builtin'
      }
      state.pendingOptionBlockCommand = null
      if (common.httpMethods.includes(word)) return 'atom'
      if (common.protocolAtoms.includes(word)) return 'atom'
      return null
    }

    state.pendingOptionBlockCommand = null
    stream.next()
    return null
  },
  languageData: {
    autocomplete: blockRulesCompletionSource,
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    indentOnInput: /^\s*(?:\{|\})$/,
  },
})
