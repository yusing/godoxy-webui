// @ts-nocheck
import { describe, expect, it } from 'bun:test'
import { useWebSocket } from '@/lib/react-use-websocket'
import {
  type ReactUseWebSocketModule,
  resolveUseWebSocketExport,
} from '@/lib/react-use-websocket.internal'

describe('react-use-websocket compatibility', () => {
  it('exposes a callable websocket hook after dependency upgrades', () => {
    expect(typeof useWebSocket).toBe('function')
  })

  it('accepts either default or named export shapes', () => {
    const defaultExport = () => 'default'
    const namedExport = () => 'named'
    const wrappedDefaultExport = () => 'wrapped-default'

    expect(resolveUseWebSocketExport({ default: defaultExport } as ReactUseWebSocketModule)).toBe(
      defaultExport
    )
    expect(
      resolveUseWebSocketExport({ useWebSocket: namedExport } as ReactUseWebSocketModule)
    ).toBe(namedExport)
    expect(
      resolveUseWebSocketExport({
        default: { default: wrappedDefaultExport },
      } as ReactUseWebSocketModule)
    ).toBe(wrappedDefaultExport)
  })
})
