import { afterEach, beforeEach, expect, spyOn, test } from 'bun:test'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router'
import { JSDOM } from 'jsdom'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { HomepageItem, RouteUptimeAggregate } from '@/lib/api'
import { api } from '@/lib/api-client'
import { ThemeProvider } from './ThemeProvider'
import AppItem from './home/AppItem'
import { store as home } from './home/store'
import RoutePercentageText from './routes/PercentageText'
import RoutesSidebar from './routes/Sidebar'
import RoutePageHeader from './routes/content/Header'
import { store as routes } from './routes/store'

let root: Root
let container: HTMLDivElement
let dom: JSDOM
const originalWebSocket = globalThis.WebSocket
const browserGlobals = [
  'window',
  'document',
  'HTMLElement',
  'Element',
  'SVGElement',
  'Node',
  'navigator',
  'localStorage',
] as const
let previousGlobals: Map<string, PropertyDescriptor | undefined>

class PendingWebSocket extends EventTarget {
  readyState = WebSocket.CONNECTING
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
  send() {}
  close() {
    this.readyState = PendingWebSocket.CLOSED
  }
}

beforeEach(() => {
  previousGlobals = new Map(
    browserGlobals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
  )
  dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost' })
  Object.defineProperty(dom.window, 'matchMedia', {
    value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  })
  Object.defineProperty(globalThis, 'WebSocket', {
    configurable: true,
    writable: true,
    value: PendingWebSocket,
  })
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  for (const key of browserGlobals) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: dom.window[key],
    })
  }
  container = dom.window.document.getElementById('root') as HTMLDivElement
  root = createRoot(container)
  home.health.set({})
  routes.uptime.set({})
  routes.routeKeys.set([])
  routes.routeDetails.set({})
  routes.displaySettings.hideUptimebar.set(true)
})

afterEach(() => {
  act(() => root.unmount())
  globalThis.WebSocket = originalWebSocket
  dom.window.close()
  for (const [key, descriptor] of previousGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

test.each(['missing', 'keys', 'value', 'subscribe', 'app.example.com'])(
  'Apps and Routes render and recover metrics for %s',
  async alias => {
    const item: HomepageItem = {
      alias,
      name: alias,
      category: 'Tests',
      description: '',
      icon: '',
      url: 'https://example.com',
      origin_url: '',
      provider: 'test',
      show: true,
      favorite: false,
      clicks: 0,
      sort_order: 0,
      all_sort_order: 0,
      fav_sort_order: 0,
      widgets: [],
    }
    home.homepageCategories.set([{ name: 'Tests', items: [item] }])
    routes.routeKeys.set([alias])
    const router = createRouter({ routeTree: createRootRoute(), history: createMemoryHistory() })
    await act(async () => {
      root.render(
        <RouterContextProvider router={router}>
          <ThemeProvider>
            <AppItem categoryIndex={0} appIndex={0} visibleIndex={0} />
            <RoutesSidebar />
          </ThemeProvider>
        </RouterContextProvider>
      )
    })
    expect(container.textContent).toContain('???')
    expect(container.textContent).toContain('UNKNOWN')
    const uptime: RouteUptimeAggregate = {
      alias,
      uptime: 0.99,
      downtime: 0.01,
      idle: 0,
      avg_latency: 10,
      current_status: 'healthy',
      statuses: [],
    }
    await act(async () => {
      home.health.set({
        [alias]: { status: 'healthy', latency: 1_000_000, sleep_in: 0, uptime: 1 },
      })
      routes.uptime.set({ [alias]: uptime })
    })
    expect(container.textContent).toContain('OK')
    expect(container.textContent).toContain('99% UP')
    await act(async () => {
      home.health.set({})
      routes.uptime.set({})
    })
    expect(container.textContent).toContain('???')
    expect(container.textContent).toContain('UNKNOWN')
  }
)

test('changing selection refreshes metadata, uptime, and the container action target', async () => {
  routes.set('routeDetails.keys.homepage.name', 'First app')
  routes.set('routeDetails.keys.container.container_id', 'first-container')
  routes.set('routeDetails.keys.container.running', true)
  routes.set('routeDetails.value.homepage.name', 'Second app')
  routes.set('routeDetails.value.container.container_id', 'second-container')
  routes.set('routeDetails.value.container.running', true)
  routes.set('uptime.keys.uptime', 0.99)
  routes.set('uptime.value.uptime', 0.5)
  window.location.hash = '#keys'
  await act(async () => {
    root.render(
      <>
        <RoutePageHeader />
        <RoutePercentageText routeKey="keys" />
      </>
    )
  })
  expect(container.querySelector('h1')?.textContent).toBe('First app')
  expect(container.textContent).toContain('99% UP')
  await act(async () => {
    window.location.hash = '#value'
    window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))
    root.render(
      <>
        <RoutePageHeader />
        <RoutePercentageText routeKey="value" />
      </>
    )
  })
  expect(container.querySelector('h1')?.textContent).toBe('Second app')
  expect(container.textContent).toContain('50% UP')
  const stop = spyOn(api.docker, 'stop').mockImplementation(async () => {
    throw new Error('test action response')
  })
  try {
    await act(async () => container.querySelectorAll('button')[1]!.click())
    expect(stop).toHaveBeenCalledWith({ id: 'second-container' })
  } finally {
    stop.mockRestore()
  }
})
