import { afterEach, expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { act } from 'react'
import type { Root } from 'react-dom/client'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  SVGElement: dom.window.SVGElement,
  Node: dom.window.Node,
  navigator: dom.window.navigator,
  localStorage: dom.window.localStorage,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0),
  cancelAnimationFrame: clearTimeout,
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
})
dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
  const height = this.classList.contains('recharts-responsive-container') ? 300 : 20
  return {
    width: 800,
    height,
    top: 0,
    left: 0,
    right: 800,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {},
  }
}

const { createRoot } = await import('react-dom/client')
const { default: MetricChart } = await import('./Charts')
const { store } = await import('../store')
let root: Root

afterEach(async () => {
  await act(async () => root.unmount())
})

test('GPU charts retain all engines across partial readings and literal PCI names', async () => {
  document.body.innerHTML = '<div id="root"></div>'
  const container = document.getElementById('root')!
  root = createRoot(container)
  const first = 'i915_0000:00:02.0 Render/3D'
  const recovered = 'i915_0000:03:00.0 Video/1'
  store.set('systemInfoGraphs.test.1h.gpu_usage', {
    total: 3,
    data: [
      { timestamp: 1, [first]: 10 },
      { timestamp: 2, [first]: 20, [recovered]: 30 },
      { timestamp: 3, [first]: 15, [recovered]: 40 },
    ],
  })
  await act(async () =>
    root.render(
      <MetricChart
        period="1h"
        type="gpu_usage"
        label="GPU Usage"
        description="Engine utilization"
        agent="test"
        yAxisFormatter={v => `${v}%`}
        hideWhenEmpty
      />
    )
  )
  expect(container.textContent).toContain(first)
  expect(container.textContent).toContain(recovered)
  const curves = container.querySelectorAll('path.recharts-area-curve')
  expect(curves).toHaveLength(2)
  for (const curve of curves) {
    expect(curve.getAttribute('d')).toMatch(/[LC]/)
    expect(curve.getAttribute('d')).not.toContain('NaN')
  }
  await act(async () => store.set('systemInfoGraphs.test.1h.gpu_usage', { total: 0, data: [] }))
  expect(container.textContent).not.toContain('GPU Usage')
})
