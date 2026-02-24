import { describe, expect, test } from 'bun:test'
import type { SyntaxNode } from '@lezer/common'
import { parser as yamlParser } from '@lezer/yaml'
import { isRulesBlockContentNode } from './yaml-rules'

function findNodesByName(node: SyntaxNode, name: string, out: SyntaxNode[] = []) {
  if (node.name === name) out.push(node)
  for (let child = node.firstChild; child; child = child.nextSibling) {
    findNodesByName(child, name, out)
  }
  return out
}

describe('isRulesBlockContentNode', () => {
  test('matches block-literal content under rules key only', () => {
    const source = `test:\n  rules: |\n    set header X-Test value\n  notes: |\n    plain text\n`
    const tree = yamlParser.parse(source)
    const contents = findNodesByName(tree.topNode, 'BlockLiteralContent')

    expect(contents).toHaveLength(2)

    const input = {
      read(from: number, to: number) {
        return source.slice(from, to)
      },
    }

    expect(isRulesBlockContentNode(contents[0], input)).toBe(true)
    expect(isRulesBlockContentNode(contents[1], input)).toBe(false)
  })
})
