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
import {
  extractDockerTimestamp,
  extractLeadingTimestamp,
  parseJournalctlTimestamp,
  resolveThemeColorsAsync,
} from './logs'

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

const ansi = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  black: '\u001b[30m',
  dim: '\u001b[2m',
  brightRed: '\u001b[91m',
  brightGreen: '\u001b[92m',
  brightYellow: '\u001b[93m',
  brightBlue: '\u001b[94m',
  brightCyan: '\u001b[96m',
  brightMagenta: '\u001b[95m',
} as const

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
          line = line.trim()
          if (!line) {
            continue
          }
          pendingLinesRef.current.push(line)
        }
      } else {
        pendingLinesRef.current.push(data.trim())
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

function formatLineForTerminal(line: string, type: 'docker' | 'proxmox') {
  const dockerTimestamp = type === 'docker' ? extractDockerTimestamp(line) : null
  const ts = dockerTimestamp
    ? dockerTimestamp.timestamp
    : type !== 'docker'
      ? extractLeadingTimestamp(line)
      : null
  const date = dockerTimestamp ? dockerTimestamp.date : ts ? new Date(ts) : null
  const hasDate = date != null && Number.isFinite(date.getTime())

  const content = ts ? line.slice(ts.length).trimStart() : line

  // For Proxmox journalctl logs, try to parse the journalctl format (e.g., "Jan 25 14:55:23")
  if (!hasDate && type === 'proxmox') {
    const ts = parseJournalctlTimestamp(line)
    if (ts && ts.match) {
      const body = formatLogContent(line.slice(ts.match.length).trimStart(), {
        hasExternalTimestamp: true,
      })
      return `${formatLocalDateTimeColored(ts.date)} ${body}`
    }
  }

  if (!hasDate) {
    return formatLogContent(content, { hasExternalTimestamp: type !== 'proxmox' })
  }

  // Prepend a static timestamp. Use ANSI dim for readability without changing log colors.
  return `${formatLocalDateTimeColored(date)} ${formatLogContent(content, { hasExternalTimestamp: true })}`
}

function formatLogContent(line: string, opts: { hasExternalTimestamp: boolean }): string {
  const formatted = tryFormatJsonLogLine(line, opts)
  return formatted ?? colorizeLogLevel(line)
}

function tryFormatJsonLogLine(
  line: string,
  opts: { hasExternalTimestamp: boolean }
): string | null {
  const firstBrace = line.indexOf('{')
  if (firstBrace === -1) return null

  const extracted = extractFirstJsonObject(line, firstBrace)
  if (!extracted) return null

  const { prefix, jsonText, suffix } = extracted

  const parsed = safeJsonParse(jsonText)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

  const obj = parsed as Record<string, unknown>

  const levelInfo = extractLevel(obj)
  const levelBadge = levelInfo ? formatLevelBadge(levelInfo.value) : ''

  const timeInfo = !opts.hasExternalTimestamp ? extractTimestamp(obj) : null
  const timestampPrefix = timeInfo ? `${formatLocalDateTimeColored(timeInfo)} ` : ''

  const excludeKeys = new Set<string>()
  if (levelInfo) excludeKeys.add(levelInfo.key)
  if (timeInfo) {
    for (const k of ['time', 'timestamp', 'ts', '@timestamp', 'datetime']) excludeKeys.add(k)
  }

  const kv = formatJsonKv(obj, { excludeKeys })
  if (!kv) return null

  const renderedPrefix = prefix.trim() ? `${ansi.dim}${prefix.trim()}${ansi.reset} ` : ''
  const renderedSuffix = suffix.trim() ? ` ${ansi.dim}${suffix.trim()}${ansi.reset}` : ''

  const header = levelBadge ? `${levelBadge} ` : ''
  return `${timestampPrefix}${renderedPrefix}${header}${kv}${renderedSuffix}`.trimEnd()
}

function extractFirstJsonObject(
  line: string,
  startIndex: number
): { prefix: string; jsonText: string; suffix: string } | null {
  let depth = 0
  let inString = false
  let escaping = false

  for (let i = startIndex; i < line.length; i++) {
    const ch = line[i]!

    if (escaping) {
      escaping = false
      continue
    }
    if (inString) {
      if (ch === '\\') {
        escaping = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) {
        const jsonText = line.slice(startIndex, i + 1)
        return {
          prefix: line.slice(0, startIndex),
          jsonText,
          suffix: line.slice(i + 1),
        }
      }
      if (depth < 0) return null
    }
  }

  return null
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function extractLevel(obj: Record<string, unknown>): { key: string; value: string } | null {
  const keys = ['level', 'loglevel', 'severity']
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return { key, value: v }
  }
  return null
}

function extractTimestamp(obj: Record<string, unknown>): Date | null {
  const candidates = ['time', 'timestamp', 'ts', '@timestamp', 'datetime']
  for (const key of candidates) {
    const v = obj[key]
    if (typeof v === 'string') {
      const d = new Date(v)
      if (!Number.isNaN(d.getTime())) return d
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      // Heuristic: > 1e12 is ms, otherwise seconds.
      const ms = v > 1e12 ? v : v * 1000
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) return d
    }
  }
  return null
}

function formatLevelBadge(levelRaw: string): string {
  const level = normalizeLevel(levelRaw)
  const color = colorForLevel(level)
  return `${color}[${level}]${ansi.reset}`
}

function normalizeLevel(levelRaw: string): string {
  const l = levelRaw.trim().toLowerCase()
  if (l === 'warning') return 'WARN'
  if (l === 'information') return 'INFO'
  if (l === 'critical') return 'FATAL'
  if (l === 'err') return 'ERROR'
  if (l === 'dbg') return 'DEBUG'
  if (l === 'trc') return 'TRACE'
  return l.toUpperCase()
}

function colorForLevel(level: string): string {
  switch (level) {
    case 'FATAL':
    case 'CRITICAL':
      return ansi.brightRed
    case 'ERROR':
    case 'ERR':
    case 'SEVERE':
      return ansi.red
    case 'WARN':
    case 'WARNING':
      return ansi.yellow
    case 'INFO':
    case 'INFORMATION':
      return ansi.green
    case 'DEBUG':
    case 'DBG':
      return ansi.blue
    case 'TRACE':
    case 'TRC':
      return ansi.dim
    case 'SUCCESS':
    case 'OK':
    case 'PASS':
      return ansi.brightGreen
    default:
      return ansi.cyan
  }
}

function formatJsonKv(
  obj: Record<string, unknown>,
  opts: {
    excludeKeys: Set<string>
  }
): string {
  const keys = Object.keys(obj)
  if (keys.length === 0) return ''

  const priorityKeys = [
    'sender',
    'component',
    'service',
    'msg',
    'message',
    'method',
    'proto',
    'uri',
    'path',
    'remote_addr',
    'local_addr',
    'request_id',
    'user_agent',
    'resp_status',
    'status',
    'resp_size',
    'elapsed_ms',
    'elapsed',
    'error',
    'err',
  ]

  const ordered = new Set<string>()
  for (const k of priorityKeys) {
    if (k in obj && !opts.excludeKeys.has(k)) ordered.add(k)
  }
  for (const k of keys) {
    if (!opts.excludeKeys.has(k)) ordered.add(k)
  }

  const parts: string[] = []
  for (const key of ordered) {
    const value = obj[key]
    if (value === undefined) continue
    parts.push(formatKvPair(key, value))
  }

  return parts.join(' ')
}

function formatKvPair(key: string, value: unknown): string {
  const keyColor = colorForKey(key)
  const sep = `${ansi.dim}=${ansi.reset}`

  // Special-case common HTTP-ish fields for readability.
  if ((key === 'resp_status' || key === 'status') && typeof value === 'number') {
    const statusColor =
      value >= 500
        ? ansi.red
        : value >= 400
          ? ansi.brightRed
          : value >= 300
            ? ansi.brightYellow
            : ansi.green
    return `${keyColor}${key}${ansi.reset}${sep}${statusColor}${value}${ansi.reset}`
  }

  return `${keyColor}${key}${ansi.reset}${sep}${formatKvValue(value)}`
}

function formatKvValue(value: unknown): string {
  if (value == null) return `${ansi.dim}null${ansi.reset}`

  if (typeof value === 'string') {
    return `"${escapeKvString(value)}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  // Objects/arrays: compact JSON.
  try {
    return `"${escapeKvString(JSON.stringify(value))}"`
  } catch {
    return `"${escapeKvString(String(value))}"`
  }
}

function escapeKvString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
}

function colorForKey(key: string): string {
  // Stable, deterministic color per key for quick scanning.
  const palette = [
    ansi.brightCyan,
    ansi.brightYellow,
    ansi.brightGreen,
    ansi.brightBlue,
    ansi.brightMagenta,
  ]
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]!
}

function colorizeLogLevel(line: string): string {
  // Log level patterns - case insensitive
  const patterns: { regex: RegExp; color: string }[] = [
    { regex: /\[(FATAL|CRITICAL)\]/gi, color: ansi.brightRed },
    { regex: /\[(ERROR|ERR|SEVERE)\]/gi, color: ansi.red },
    { regex: /\[(WARN|WARNING)\]/gi, color: ansi.yellow },
    { regex: /\[(INFO|INFORMATION)\]/gi, color: ansi.green },
    { regex: /\[(DEBUG|DBG)\]/gi, color: ansi.blue },
    { regex: /\[(TRACE|TRC)\]/gi, color: ansi.dim },
    { regex: /\[(SUCCESS|OK|PASS)\]/gi, color: ansi.brightGreen },
  ]

  let result = line
  for (const { regex, color } of patterns) {
    result = result.replace(regex, `${color}$&${ansi.reset}`)
  }

  return result
}

function formatLocalDateTimeColored(date: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${ansi.dim}${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}${ansi.reset}`
}
