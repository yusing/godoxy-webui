import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import { GoDoxyErrorText } from './GoDoxyError'

describe('GoDoxyErrorText', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost',
    })

    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.window = dom.window as typeof globalThis.window
    globalThis.document = dom.window.document
    globalThis.HTMLElement = dom.window.HTMLElement
    globalThis.SVGElement = dom.window.SVGElement
    globalThis.Node = dom.window.Node
    globalThis.navigator = dom.window.navigator
    globalThis.localStorage = dom.window.localStorage

    container = dom.window.document.getElementById('root') as HTMLDivElement
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
  })

  test('escapes markup in ANSI-rendered text', () => {
    act(() => {
      root.render(<GoDoxyErrorText err={'\x1b[31m<script>alert("xss")</script>\x1b[0m'} />)
    })

    expect(container.querySelector('script')).toBeNull()
    expect(container.innerHTML).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;')
  })
})
