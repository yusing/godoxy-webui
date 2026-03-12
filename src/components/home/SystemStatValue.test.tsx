import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import SystemStatValue from './SystemStatValue'
import { store } from './store'

describe('SystemStatValue network speed rendering', () => {
  let root: Root | undefined
  let container: HTMLDivElement

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

    store.systemInfo.networkSpeedDownload.set(0)
  })

  afterEach(() => {
    if (!root) return
    act(() => {
      root?.unmount()
    })
  })

  test('keeps formatting download speed after consecutive updates', () => {
    act(() => {
      root.render(<SystemStatValue valueKey="networkSpeedDownload" type="download" />)
    })

    act(() => {
      store.systemInfo.networkSpeedDownload.set(20 * 1024 * 1024)
    })

    expect(container.innerHTML).toContain('20 MB/s')
    expect(container.innerHTML).not.toContain('20971520')

    act(() => {
      store.systemInfo.networkSpeedDownload.set(21 * 1024 * 1024)
    })

    expect(container.innerHTML).toContain('21 MB/s')
    expect(container.innerHTML).not.toContain('22020096')
  })
})
