import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Event as ApiEvent, Route } from '@/lib/api'
import { EventsList } from './EventList'
import { store } from './store'

type PoolEventData =
  | Pick<Route, 'alias'>
  | { name: string; id: string }
  | { name: string; display: string; removed_at: string }

const routeCategories = [
  ['pool.http_routes', 'HTTP route'],
  ['pool.stream_routes', 'Stream route'],
  ['pool.excluded_routes', 'Excluded route'],
] as const

const removalCategories = [...routeCategories, ['pool.proxmox_nodes', '']] as const

function renderPoolEvent(category: string, action: string, data: PoolEventData) {
  store.events.set([
    {
      category,
      action,
      data,
      level: 'info',
      timestamp: '2026-10-02T00:00:00Z',
      uuid: 'pool-event-test',
    },
  ])
  const markup = renderToStaticMarkup(<EventsList />)
  const document = new JSDOM(markup).window.document
  const summary = document.querySelector('.text-sm.leading-snug')?.textContent
  return { markup, document, summary }
}

describe('EventsList pool event rendering', () => {
  let previousEvents: ApiEvent[]

  beforeEach(() => {
    previousEvents = store.events.value
  })

  afterEach(() => {
    store.events.set(previousEvents)
  })

  for (const action of ['added', 'reloaded'] as const) {
    test.each(routeCategories)(`%s ${action} keeps the route alias`, (category, label) => {
      const alias = '*.app.example.com'
      const { summary } = renderPoolEvent(category, action, { alias })

      expect(summary).toBe(`${label} ${alias} ${action}`)
    })

    test(`Proxmox node ${action} keeps its name and id`, () => {
      const { summary } = renderPoolEvent('pool.proxmox_nodes', action, {
        name: 'proxmox-host',
        id: 'node-42',
      })

      expect(summary).toBe(`proxmox-host (node-42) ${action}`)
    })
  }

  test.each(removalCategories)('%s removal uses the display value', (category, label) => {
    const { summary } = renderPoolEvent(category, 'removed', {
      name: 'internal-pool-key',
      display: 'Friendly display (public-key)',
      removed_at: '2026-10-02T00:00:01Z',
    })

    expect(summary).toBe(`${label ? `${label} ` : ''}Friendly display (public-key) removed`)
    expect(summary).not.toContain('internal-pool-key')
    expect(summary).not.toContain('undefined')
  })

  test.each(removalCategories)(
    '%s removal falls back to name for an empty display',
    (category, label) => {
      const { summary } = renderPoolEvent(category, 'removed', {
        name: 'pool-key',
        display: '',
        removed_at: '2026-10-02T00:00:01Z',
      })

      expect(summary).toBe(`${label ? `${label} ` : ''}pool-key removed`)
      expect(summary).not.toContain('undefined')
    }
  )

  test.each(removalCategories)('%s removal escapes markup in display', (category, label) => {
    const display = '<script>alert("xss")</script> & node'
    const { markup, document, summary } = renderPoolEvent(category, 'removed', {
      name: 'internal-pool-key',
      display,
      removed_at: '2026-10-02T00:00:01Z',
    })

    expect(summary).toBe(`${label ? `${label} ` : ''}${display} removed`)
    expect(document.querySelector('script')).toBeNull()
    expect(markup).toContain('&lt;script&gt;')
    expect(markup).toContain('&lt;/script&gt; &amp; node')
    expect(markup).not.toContain('<script>')
  })
})
