import { describe, expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { registerBfcacheReload } from './bfcache-reload'

describe('registerBfcacheReload', () => {
  test('reloads when a page is restored from bfcache', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost/routes',
    })
    let reloadCount = 0

    const dispose = registerBfcacheReload(dom.window, () => {
      reloadCount += 1
    })
    const event = new dom.window.Event('pageshow')
    Object.defineProperty(event, 'persisted', {
      configurable: true,
      value: true,
    })

    dom.window.dispatchEvent(event)

    expect(reloadCount).toBe(1)
    dispose()
  })

  test('ignores normal pageshow events and removes the listener on dispose', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost/routes',
    })
    let reloadCount = 0

    const dispose = registerBfcacheReload(dom.window, () => {
      reloadCount += 1
    })
    const initialShow = new dom.window.Event('pageshow')
    Object.defineProperty(initialShow, 'persisted', {
      configurable: true,
      value: false,
    })

    dom.window.dispatchEvent(initialShow)
    expect(reloadCount).toBe(0)

    dispose()

    const restoredShow = new dom.window.Event('pageshow')
    Object.defineProperty(restoredShow, 'persisted', {
      configurable: true,
      value: true,
    })

    dom.window.dispatchEvent(restoredShow)
    expect(reloadCount).toBe(0)
  })
})
