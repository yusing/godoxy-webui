import { describe, expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { shouldIgnoreOuterWheelSnap } from './SectionedForm'

function setScrollableMetrics(
  el: HTMLElement,
  {
    scrollTop,
    clientHeight,
    scrollHeight,
  }: { scrollTop: number; clientHeight: number; scrollHeight: number }
) {
  Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: scrollTop })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
}

describe('shouldIgnoreOuterWheelSnap', () => {
  test('ignores outer snap when nested scrollable can consume downward scroll', () => {
    const dom = new JSDOM('<div id="root"><div id="nested"><div id="target"></div></div></div>')
    const { document } = dom.window
    const root = document.getElementById('root') as HTMLElement
    const nested = document.getElementById('nested') as HTMLElement
    const target = document.getElementById('target') as HTMLElement

    root.style.overflowY = 'auto'
    nested.style.overflowY = 'auto'
    setScrollableMetrics(root, { scrollTop: 0, clientHeight: 400, scrollHeight: 1200 })
    setScrollableMetrics(nested, { scrollTop: 40, clientHeight: 120, scrollHeight: 400 })

    expect(shouldIgnoreOuterWheelSnap(target, root, 20)).toBe(true)
  })

  test('does not ignore when nested scrollable cannot consume and is not focused', () => {
    const dom = new JSDOM(
      '<div id="root"><div id="nested"><div id="target"></div></div><button id="outside"></button></div>'
    )
    const { document } = dom.window
    const root = document.getElementById('root') as HTMLElement
    const nested = document.getElementById('nested') as HTMLElement
    const target = document.getElementById('target') as HTMLElement
    const outside = document.getElementById('outside') as HTMLElement

    root.style.overflowY = 'auto'
    nested.style.overflowY = 'auto'
    setScrollableMetrics(root, { scrollTop: 0, clientHeight: 400, scrollHeight: 1200 })
    setScrollableMetrics(nested, { scrollTop: 280, clientHeight: 120, scrollHeight: 400 })

    outside.focus()

    expect(shouldIgnoreOuterWheelSnap(target, root, 20)).toBe(false)
  })

  test('ignores when nested scrollable contains focused element', () => {
    const dom = new JSDOM('<div id="root"><div id="nested"><input id="field" /></div></div>')
    const { document } = dom.window
    const root = document.getElementById('root') as HTMLElement
    const nested = document.getElementById('nested') as HTMLElement
    const field = document.getElementById('field') as HTMLElement

    root.style.overflowY = 'auto'
    nested.style.overflowY = 'auto'
    setScrollableMetrics(root, { scrollTop: 0, clientHeight: 400, scrollHeight: 1200 })
    setScrollableMetrics(nested, { scrollTop: 280, clientHeight: 120, scrollHeight: 400 })

    field.focus()

    expect(shouldIgnoreOuterWheelSnap(field, root, 20)).toBe(true)
  })
})
