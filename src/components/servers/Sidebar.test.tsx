import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import type { SystemInfo } from '@/lib/api'
import ServersSidebar from './Sidebar'
import { store } from './store'

function setGlobal<K extends keyof typeof globalThis>(key: K, value: (typeof globalThis)[K]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  })
}

function systemInfo({
  cpu,
  disk,
  download,
  memoryTotal,
  memoryUsed,
  sensors = [],
  upload,
}: {
  cpu: number
  disk: number
  download: number
  memoryTotal: number
  memoryUsed: number
  sensors?: SystemInfo['sensors']
  upload: number
}): SystemInfo {
  return {
    timestamp: 60,
    cpu_average: cpu,
    memory: {
      available: memoryTotal - memoryUsed,
      total: memoryTotal,
      used: memoryUsed,
      used_percent: (memoryUsed / memoryTotal) * 100,
    },
    disks: {
      '/': {
        path: '/',
        fstype: 'ext4',
        total: 100,
        free: 100 - disk,
        used: disk,
        used_percent: disk,
        inodesUsedPercent: 0,
      },
    },
    disks_io: {},
    network: {
      bytes_recv: 0,
      bytes_sent: 0,
      download_speed: download,
      upload_speed: upload,
    },
    sensors,
  }
}

describe('ServersSidebar metrics', () => {
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

    const gb = 1024 ** 3
    store.config.set({
      aliases: [],
      display_name: 'custom-main',
      inbound_mtls_profile: '',
    })
    store.agents.set({
      'agent.example': {
        addr: 'agent.example:8890',
        name: 'agent.example',
        runtime: 'docker',
        supports_tcp_stream: true,
        supports_udp_stream: true,
        version: 'test',
      },
    })
    store.systemInfo.set({
      GoDoxy: systemInfo({
        cpu: 12,
        disk: 45,
        download: 2 * 1024,
        memoryTotal: 2 * gb,
        memoryUsed: gb,
        upload: 1024,
      }),
      'agent.example': systemInfo({
        cpu: 4,
        disk: 1.5,
        download: 727,
        memoryTotal: 4 * gb,
        memoryUsed: gb,
        sensors: [
          { name: 'cpu_thermal', temperature: 36, high: 80, critical: 100 },
          { name: 'nvme_composite', temperature: 38, high: 80, critical: 100 },
        ],
        upload: 4 * 1024,
      }),
    })
  })

  afterEach(() => {
    if (!root) return
    act(() => {
      root?.unmount()
    })
  })

  test('uses stable dot-safe metric keys for the main server and dotted agent names', () => {
    act(() => {
      root?.render(<ServersSidebar />)
    })

    const mainCard = container.querySelector<HTMLAnchorElement>('a[href="#"]')
    const agentCard = container.querySelector<HTMLAnchorElement>('a[href="#agent.example"]')

    expect(mainCard?.textContent).toContain('custom-main')
    expect(mainCard?.textContent).toContain('12%')
    expect(mainCard?.textContent).toContain('1/2 GB')
    expect(mainCard?.textContent).toContain('45%')
    expect(mainCard?.textContent).toContain('1 KB/s')
    expect(mainCard?.textContent).toContain('2 KB/s')

    expect(agentCard?.textContent).toContain('agent.example')
    expect(agentCard?.textContent).toContain('4.0%')
    expect(agentCard?.textContent).toContain('1/4 GB')
    expect(agentCard?.textContent).toContain('1.5%')
    expect(agentCard?.textContent).toContain('4 KB/s')
    expect(agentCard?.textContent).toContain('727 B/s')
    expect(agentCard?.textContent).toContain('36 °C / 38 °C')

    expect(mainCard?.querySelector('.bg-\\(--ds-running-bg\\)')).not.toBeNull()
    expect(agentCard?.querySelector('.bg-\\(--ds-running-bg\\)')).not.toBeNull()
    expect(mainCard?.querySelector('.bg-\\(--ds-status-stopped-bg\\)')).toBeNull()
    expect(agentCard?.querySelector('.bg-\\(--ds-status-stopped-bg\\)')).toBeNull()
  })
})
