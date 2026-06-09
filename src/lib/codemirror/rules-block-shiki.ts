import { createHighlighter, type LanguageRegistration } from 'shiki'
import { useTheme } from '@/components/ThemeProvider'
import * as common from './rules-block-common'

// Escape a string for use in a regex character class or alternation
function escRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const controlKw = [...common.controlKeywords].map(escRe).join('|')
const conditionKw = [...common.conditionKeywords].map(escRe).join('|')
const patternFn = [...common.patternFunctions].map(escRe).join('|')
const httpMethodsRe = common.httpMethods.map(escRe).join('|')
const protocolAtomsRe = common.protocolAtoms.map(escRe).join('|')
const logLevelsRe = common.logLevels.map(escRe).join('|')
const mutationActionsRe = [...common.mutationActions].map(escRe).join('|')
const mutationFieldsRe = [...common.mutationFieldKeywords].map(escRe).join('|')
const dynamicVarFnsRe = common.dynamicVariableFunctions.map(escRe).join('|')
const staticVarsRe = common.staticVariables.map(escRe).join('|')

const commandOptionBlockPatterns = [...common.commandOptionFields]
  .filter(([, fields]) => fields.length > 0)
  .map(([command, fields]) => {
    const optionFieldsRe = fields.map(field => escRe(field.name)).join('|')
    return {
      begin: `\\b(${escRe(command)})\\s*(\\{)`,
      end: '\\}',
      beginCaptures: {
        '1': { name: 'keyword.other.action.rules-block' },
        '2': { name: 'punctuation.section.block.begin.rules-block' },
      },
      endCaptures: {
        '0': { name: 'punctuation.section.block.end.rules-block' },
      },
      patterns: [
        { include: '#block-comment' },
        { include: '#line-comment-slash' },
        { include: '#line-comment-hash' },
        {
          match: `(^|[\\s{])(${optionFieldsRe})(\\s*:)`,
          captures: {
            '2': { name: 'variable.other.property.rules-block' },
            '3': { name: 'punctuation.separator.key-value.rules-block' },
          },
        },
        {
          match: `\\b(${logLevelsRe})\\b`,
          name: 'entity.name.type.rules-block',
        },
        {
          match: `\\b(${mutationFieldsRe})\\b`,
          name: 'variable.parameter.rules-block',
        },
        { include: '#strings' },
        { include: '#dynamic-variable' },
        { include: '#variables' },
        { include: '#constants' },
        { include: '#numbers' },
      ],
    }
  })

const blockRulesShiki: LanguageRegistration = {
  name: 'rules-block',
  scopeName: 'source.rules-block',
  patterns: [
    { include: '#block-comment' },
    { include: '#line-comment-slash' },
    { include: '#line-comment-hash' },
    { include: '#command-option-block' },
    { include: '#strings' },
    { include: '#log-statement' },
    { include: '#mutation-statement' },
    { include: '#method-statement' },
    { include: '#proto-statement' },
    { include: '#pattern-function' },
    { include: '#dynamic-variable' },
    { include: '#variables' },
    { include: '#keywords' },
    { include: '#constants' },
    { include: '#numbers' },
    { include: '#operators' },
  ],
  repository: {
    // Block comment: /* ... */ only at word boundary (start of line or after whitespace)
    'block-comment': {
      patterns: [
        {
          // Only match /* when preceded by start-of-line or whitespace
          begin: '(?:^|(?<=\\s))/\\*',
          end: '\\*/',
          name: 'comment.block.rules-block',
        },
      ],
    },
    // Line comment: // only when NOT preceded by ':'
    'line-comment-slash': {
      patterns: [
        {
          // Match // not preceded by ':'
          match: '(?<!:)//.*$',
          name: 'comment.line.double-slash.rules-block',
        },
      ],
    },
    // Line comment: # only at start of line or after whitespace
    'line-comment-hash': {
      patterns: [
        {
          match: '(?:^|(?<=\\s))#.*$',
          name: 'comment.line.number-sign.rules-block',
        },
      ],
    },
    strings: {
      patterns: [
        {
          begin: '"',
          end: '"',
          name: 'string.quoted.double.rules-block',
          patterns: [
            { match: '\\\\.', name: 'constant.character.escape.rules-block' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
          ],
        },
        {
          begin: "'",
          end: "'",
          name: 'string.quoted.single.rules-block',
          patterns: [
            { match: '\\\\.', name: 'constant.character.escape.rules-block' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
          ],
        },
      ],
    },
    'command-option-block': {
      patterns: commandOptionBlockPatterns,
    },
    // log/notify <level> — level gets typeName treatment
    'log-statement': {
      patterns: [
        {
          // Match: log/notify keyword, then optional string arg, then log level
          begin: `\\b(log|notify)\\b`,
          end: `(?=$|[{}&|])`,
          beginCaptures: {
            '1': { name: 'keyword.other.action.rules-block' },
          },
          patterns: [
            { include: '#block-comment' },
            { include: '#line-comment-slash' },
            { include: '#line-comment-hash' },
            {
              // log level word (first bare word after log/notify)
              match: `\\b(${logLevelsRe})\\b`,
              name: 'entity.name.type.rules-block',
            },
            { include: '#strings' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
            { include: '#constants' },
            { include: '#numbers' },
          ],
        },
      ],
    },
    // set/add/remove <field> — field gets attributeName treatment
    'mutation-statement': {
      patterns: [
        {
          begin: `\\b(${mutationActionsRe})\\b`,
          end: `(?=$|[{}&|])`,
          beginCaptures: {
            '1': { name: 'keyword.other.action.rules-block' },
          },
          patterns: [
            { include: '#block-comment' },
            { include: '#line-comment-slash' },
            { include: '#line-comment-hash' },
            {
              // mutation field keyword
              match: `\\b(${mutationFieldsRe})\\b`,
              name: 'variable.parameter.rules-block',
            },
            { include: '#strings' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
            { include: '#constants' },
            { include: '#numbers' },
          ],
        },
      ],
    },
    // method <HTTP_METHOD>
    'method-statement': {
      patterns: [
        {
          begin: '\\bmethod\\b',
          end: `(?=$|[{}&|])`,
          beginCaptures: {
            '0': { name: 'keyword.other.condition.rules-block' },
          },
          patterns: [
            {
              match: `\\b(${httpMethodsRe})\\b`,
              name: 'constant.language.method.rules-block',
            },
            { include: '#strings' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
            { include: '#numbers' },
          ],
        },
      ],
    },
    // proto <protocol>
    'proto-statement': {
      patterns: [
        {
          begin: '\\bproto\\b',
          end: `(?=$|[{}&|])`,
          beginCaptures: {
            '0': { name: 'keyword.other.condition.rules-block' },
          },
          patterns: [
            {
              match: `\\b(${protocolAtomsRe})\\b`,
              name: 'constant.language.protocol.rules-block',
            },
            { include: '#strings' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
            { include: '#numbers' },
          ],
        },
      ],
    },
    // Pattern functions: glob(...) / regex(...) — args are strings
    'pattern-function': {
      patterns: [
        {
          begin: `\\b(${patternFn})\\s*(\\()`,
          end: '\\)',
          beginCaptures: {
            '1': { name: 'entity.name.function.rules-block' },
            '2': { name: 'punctuation.rules-block' },
          },
          endCaptures: {
            '0': { name: 'punctuation.rules-block' },
          },
          contentName: 'string.unquoted.pattern-args.rules-block',
          patterns: [{ include: '#strings' }],
        },
      ],
    },
    // Dynamic variable functions: $header(...), $redacted(...), etc.
    'dynamic-variable': {
      patterns: [
        {
          // $dynamicFn( — treat as builtin/function
          begin: `\\$(${dynamicVarFnsRe})\\s*(\\()`,
          end: '\\)',
          beginCaptures: {
            '0': { name: 'variable.other.builtin.rules-block' },
            '2': { name: 'punctuation.rules-block' },
          },
          endCaptures: {
            '0': { name: 'punctuation.rules-block' },
          },
          patterns: [
            { include: '#strings' },
            { include: '#dynamic-variable' },
            { include: '#variables' },
            { include: '#numbers' },
            {
              match: '[A-Za-z_][A-Za-z0-9_.:/-]*',
              name: 'variable.parameter.rules-block',
            },
          ],
        },
      ],
    },
    variables: {
      patterns: [
        { match: '\\$\\{[A-Za-z_][A-Za-z0-9_]*\\}', name: 'variable.other.rules-block' },
        { match: `\\$(${staticVarsRe})\\b`, name: 'variable.other.rules-block' },
        { match: '\\$[A-Za-z_][A-Za-z0-9_]*', name: 'variable.other.rules-block' },
      ],
    },
    keywords: {
      patterns: [
        {
          match: `\\b(?:${controlKw})\\b`,
          name: 'keyword.control.rules-block',
        },
        {
          match: `\\b(?:${conditionKw})\\b`,
          name: 'keyword.other.condition.rules-block',
        },
        {
          // action keywords excluding log/notify/set/add/remove (handled by dedicated rules)
          // includes in-process directives such as `handle`
          match: `\\b(?:${[...common.actionKeywords]
            .filter(k => !common.mutationActions.has(k) && k !== 'log' && k !== 'notify')
            .map(escRe)
            .join('|')})\\b`,
          name: 'keyword.other.action.rules-block',
        },
      ],
    },
    constants: {
      patterns: [
        {
          match: `\\b(?:${httpMethodsRe})\\b`,
          name: 'constant.language.method.rules-block',
        },
        {
          match: `\\b(?:${protocolAtomsRe})\\b`,
          name: 'constant.language.protocol.rules-block',
        },
      ],
    },
    numbers: {
      patterns: [
        { match: '\\b\\d+(?:\\.\\d+)?(?:-\\d+)?(?:xx)?\\b', name: 'constant.numeric.rules-block' },
      ],
    },
    operators: {
      patterns: [{ match: '[&|]', name: 'keyword.operator.rules-block' }],
    },
  },
}

const blockRulesShikiHighlighter = await createHighlighter({
  themes: ['tokyo-night', 'ayu-light'],
  langs: [blockRulesShiki],
})

export function blockRulesHighlightShiki(value: string) {
  const { resolvedTheme } = useTheme()
  return blockRulesShikiHighlighter.codeToHtml(value, {
    lang: 'rules-block',
    theme: resolvedTheme === 'dark' ? 'tokyo-night' : 'ayu-light',
  })
}
