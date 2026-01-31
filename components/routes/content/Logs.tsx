import { Button } from '@/components/ui/button'
import { useWebSocketApi } from '@/hooks/websocket'
import { useTheme } from 'next-themes'

import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'
import { FitAddon } from '@xterm/addon-fit'
import { WebFontsAddon } from '@xterm/addon-web-fonts'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'

import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { store, type RouteKey } from '../store'

import '@xterm/xterm/css/xterm.css'

import '@fontsource/cascadia-code/400.css'
import '@fontsource/cascadia-code/700.css'

import { Query } from '@/lib/query'
import '../style.css'
import { formatLineForTerminal, resolveThemeColorsAsync } from './logs'

import { createAtom, type Atom } from 'juststore'

export default function Logs({ routeKey }: { routeKey: RouteKey }) {
  const logsRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const setScrollDirectionRef = useRef<((next: 'up' | 'down') => void) | null>(null)
  const maximizedAtom = createAtom(useId(), false)

  useLayoutEffect(() => {
    const container = logsRef.current
    if (!container) return

    // Ensure we're starting from a clean DOM node.
    container.innerHTML = ''

    let cancelled = false
    let raf: number | null = null
    let resizeObserver: ResizeObserver | null = null

    const updateScrollDirection = () => {
      const term = termRef.current
      if (!term) return
      // Check if we're in the bottom half of the buffer
      const totalLines = term.buffer.active.length
      const viewportLines = term.rows
      const scrollOffset = term.buffer.active.viewportY
      // viewportY is the offset from the top of the buffer
      // If we're past the midpoint, show up arrow
      const maxScroll = Math.max(0, totalLines - viewportLines)
      const next = scrollOffset >= maxScroll / 2 ? 'up' : 'down'
      setScrollDirectionRef.current?.(next)
    }

    const cleanup = () => {
      cancelled = true
      if (raf != null) cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      fitAddonRef.current = null
      termRef.current?.dispose()
      termRef.current = null
    }

    const scheduleFit = () => {
      if (raf != null) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (cancelled) return
        try {
          fitAddonRef.current?.fit()
        } catch {
          // FitAddon throws when container isn't measurable (e.g. hidden).
        }
      })
    }

    const init = async () => {
      // xterm.js renders to canvas and cannot resolve CSS variables directly.
      // We must compute the actual color value at runtime.
      // Use async resolution to ensure CSS variables are ready.

      const theme = await resolveThemeColorsAsync()
      if (cancelled) return

      const term = new Terminal({
        convertEol: true,
        disableStdin: true,
        scrollback: 5000,
        allowTransparency: true,
        fontFamily: '"Cascadia Code", monospace',
        fontSize: 12,
        fontWeight: '400',
        fontWeightBold: '700',
        lineHeight: 1.2,
        theme,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      const webLinksAddon = new WebLinksAddon()
      term.loadAddon(webLinksAddon)

      // Use the official xterm web fonts addon to ensure fonts are loaded
      // before xterm measures character widths. This prevents spacing artifacts.
      const webFontsAddon = new WebFontsAddon()
      term.loadAddon(webFontsAddon)

      // Wait for fonts to be fully loaded before opening the terminal
      await webFontsAddon.loadFonts(['Cascadia Code'])
      if (cancelled) return

      term.open(container)

      termRef.current = term
      fitAddonRef.current = fitAddon

      resizeObserver = new ResizeObserver(() => scheduleFit())
      resizeObserver.observe(container)

      // Listen for scroll events using xterm's onScroll event
      term.onScroll(() => updateScrollDirection())
      updateScrollDirection()

      scheduleFit()
    }

    void init()

    return () => cleanup()
  }, [routeKey])

  useEffect(() => {
    const term = termRef.current
    if (term) {
      term.reset()
      term.clear()
    }
  }, [routeKey, termRef])

  useEffect(() => {
    const unsubscribe = maximizedAtom.subscribe(maximized => {
      const log = logsRef.current
      if (log) {
        log.setAttribute('data-maximized', maximized.toString())
      }
    })
    return unsubscribe
  })

  return (
    <>
      <Suspense>
        <LogProvider key={routeKey} routeKey={routeKey} termRef={termRef} />
      </Suspense>
      <LogsInner
        key={routeKey}
        maximizedAtom={maximizedAtom}
        logsRef={logsRef}
        termRef={termRef}
        setScrollDirectionRef={setScrollDirectionRef}
      />
    </>
  )
}

function LogsInner({
  maximizedAtom,
  logsRef,
  termRef,
  setScrollDirectionRef,
}: {
  maximizedAtom: Atom<boolean>
  logsRef: React.RefObject<HTMLDivElement | null>
  termRef: React.RefObject<Terminal | null>
  setScrollDirectionRef: React.RefObject<((next: 'up' | 'down') => void) | null>
}) {
  'use memo'

  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')

  useEffect(() => {
    setScrollDirectionRef.current = next =>
      setScrollDirection(prev => (prev === next ? prev : next))
  }, [setScrollDirectionRef, setScrollDirection])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return

      const container = containerRef.current
      if (!container) return

      const activeElement = document.activeElement
      if (!activeElement || !container.contains(activeElement)) return

      e.preventDefault()
      e.stopPropagation()

      maximizedAtom.set(!maximizedAtom.value)
      container.focus()
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [containerRef, maximizedAtom])

  return (
    <div
      ref={containerRef}
      className="relative
      has-data-[maximized=true]:absolute has-data-[maximized=true]:px-[5vw] has-data-[maximized=true]:py-[5vh] has-data-[maximized=true]:top-0 has-data-[maximized=true]:left-0
      has-data-[maximized=true]:h-full has-data-[maximized=true]:w-full
      has-data-[maximized=true]:p-4 has-data-[maximized=true]:z-50"
      tabIndex={0}
    >
      <Suspense>
        <LogThemeUpdater termRef={termRef} />
      </Suspense>
      <div
        className="overflow-hidden rounded-md border bg-muted/30 tracking-normal p-2 h-[45vh] has-data-[maximized=true]:h-full relative"
        style={{
          backgroundColor: 'var(--xterm-background)',
        }}
      >
        <div ref={logsRef} className="h-full w-full" />
        <div className="absolute top-4 right-4">
          <maximizedAtom.Render>
            {(maximized, setExpanded) => (
              <Button
                size="icon"
                variant="ghost"
                className="bg-background/80 hover:bg-background"
                aria-label={maximized ? 'Minimize logs' : 'Maximize logs'}
                onClick={() => setExpanded(!maximized)}
              >
                {maximized ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
              </Button>
            )}
          </maximizedAtom.Render>
        </div>
        <div className="absolute bottom-4 right-4">
          <Button
            size="icon"
            className="bg-teal-500/80 text-white"
            aria-label={scrollDirection === 'up' ? 'Scroll to top' : 'Scroll to bottom'}
            onClick={() => {
              const term = termRef.current
              if (!term) return

              if (scrollDirection === 'up') {
                term.scrollToTop()
              } else {
                term.scrollToBottom()
              }
            }}
          >
            <LogChevron direction={scrollDirection} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function LogChevron({ direction }: { direction: 'up' | 'down' }) {
  return direction === 'up' ? <IconChevronUp /> : <IconChevronDown />
}

function LogThemeUpdater({ termRef }: { termRef: React.RefObject<Terminal | null> }) {
  const { resolvedTheme } = useTheme()
  const prevThemeRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (resolvedTheme === prevThemeRef.current) return
    prevThemeRef.current = resolvedTheme

    const term = termRef.current
    if (!term) return

    let cancelled = false

    const updateTheme = async () => {
      const colors = await resolveThemeColorsAsync()
      if (cancelled || termRef.current !== term) return
      term.options.theme = colors
    }

    updateTheme()

    return () => {
      cancelled = true
    }
  }, [resolvedTheme, termRef])

  return null
}

function LogProvider({
  routeKey,
  termRef,
}: {
  routeKey: RouteKey
  termRef: React.RefObject<Terminal | null>
}) {
  const proxmox = store.routeDetails[routeKey]?.proxmox.use()
  const containerId = store.routeDetails[routeKey]?.container.useCompute(
    container => container?.container_id
  )

  const endpoint = useMemo(() => {
    if (containerId) {
      return `/docker/logs/${containerId}`
    }
    if (proxmox && proxmox.node) {
      if (proxmox.files && proxmox.files.length > 0) {
        const basePath = `/proxmox/tail`
        const query = new Query()
        query.add('node', proxmox.node)
        query.addAll('file', proxmox.files)
        if (proxmox.vmid) {
          query.add('vmid', proxmox.vmid.toString())
        }
        return `${basePath}?${query.toString()}`
      }
      const basePath = `/proxmox/journalctl`
      const query = new Query()
      query.add('node', proxmox.node)
      if (proxmox.vmid) {
        query.add('vmid', proxmox.vmid.toString())
      }
      if (proxmox.services && proxmox.services.length > 0) {
        query.addAll('service', proxmox.services)
      }
      return `${basePath}?${query.toString()}`
    }
    return ''
  }, [containerId, proxmox])

  const containerIdRef = useRef(containerId)

  const pendingLinesRef = useRef<string[]>([])
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }

    if (pendingLinesRef.current.length === 0) {
      return
    }

    const term = termRef.current
    if (!term) return

    const batch = pendingLinesRef.current
    pendingLinesRef.current = []

    const isDocker = Boolean(containerId)
    for (const line of batch) {
      term.writeln(formatLineForTerminal(line, isDocker ? 'docker' : 'proxmox'))
    }

    if (store.logsAutoScroll.value) {
      term.scrollToBottom()
    }
  }, [termRef, containerId])

  const scheduleFlush = useCallback(() => {
    // Aggregate multiple websocket messages into a single terminal write.
    // Throttle interval is intentionally small to keep UI responsive.
    const throttleMs = 75
    if (flushTimeoutRef.current) return
    flushTimeoutRef.current = setTimeout(flush, throttleMs)
  }, [flush])

  const enqueue = useCallback(
    (data: string) => {
      if (proxmox) {
        // journalctl
        for (let line of data.split('\n')) {
          line = line.trimEnd()
          if (!line) {
            continue
          }
          pendingLinesRef.current.push(line)
        }
      } else {
        pendingLinesRef.current.push(data.replace(/[\r\n]+$/g, ''))
      }
      scheduleFlush()
    },
    [scheduleFlush, proxmox]
  )

  useLayoutEffect(() => {
    containerIdRef.current = containerId
    pendingLinesRef.current = []
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }
  }, [containerId])

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current)
        flushTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!endpoint) {
      const term = termRef.current
      if (term) {
        term.writeln(
          formatLineForTerminal(`${new Date().toISOString()} No logs available`, 'docker')
        )
      }
    }
  }, [endpoint, termRef])

  useWebSocketApi<string>({
    endpoint,
    json: false,
    query: {
      limit: 100,
    },
    shouldConnect: !!endpoint,
    onMessage: data => {
      if (containerIdRef.current !== containerId) return
      enqueue(data)
    },
    onError: error => {
      if (containerIdRef.current !== containerId) return
      enqueue(`${new Date().toISOString()} ${error}`)
    },
  })

  return null
}
