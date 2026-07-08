import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import SystemStatValue from './SystemStatValue'
import { store } from './store'

function setGlobal<K extends keyof typeof globalThis>(key: K, value: (typeof globalThis)[K]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  })
}

describe('SystemStatValue network speed rendering', () => {
  let root: Root | undefined
  let container: HTMLDivElement

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost',
    })
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    setGlobal('window', dom.window as typeof globalThis.window)
    setGlobal('document', dom.window.document)
    setGlobal('HTMLElement', dom.window.HTMLElement)
    setGlobal('SVGElement', dom.window.SVGElement)
    setGlobal('Node', dom.window.Node)
    setGlobal('navigator', dom.window.navigator)
    setGlobal('localStorage', dom.window.localStorage)

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
