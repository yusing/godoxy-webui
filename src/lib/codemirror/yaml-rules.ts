import type { Input, SyntaxNode, SyntaxNodeRef } from '@lezer/common'

function findAncestorByName(node: SyntaxNode | null, name: string) {
  for (let current = node; current; current = current.parent) {
    if (current.name === name) return current
  }
  return null
}

function normalizeYamlKey(key: string) {
  if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) {
    return key.slice(1, -1)
  }
  return key
}

export function isRulesBlockContentNode(
  node: SyntaxNodeRef | undefined,
  input: Pick<Input, 'read'>
) {
  if (!node) return false

  if (node.name !== 'BlockLiteralContent') return false

  const blockLiteral = findAncestorByName(node.node, 'BlockLiteral')
  if (!blockLiteral) return false

  const pair = findAncestorByName(blockLiteral, 'Pair')
  if (!pair) return false

  const key = pair.getChild('Key')
  const keyNode = key?.getChild('Literal') ?? key?.getChild('QuotedLiteral')
  if (!keyNode) return false

  return normalizeYamlKey(input.read(keyNode.from, keyNode.to).trim()) === 'rules'
}
