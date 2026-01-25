import LoadingRing from '@/components/LoadingRing'
import { Button } from '@/components/ui/button'
import { useWebSocketApi } from '@/hooks/websocket'

import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { FitAddon } from '@xterm/addon-fit'
import { WebFontsAddon } from '@xterm/addon-web-fonts'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { store, type RouteKey } from '../store'

import '@xterm/xterm/css/xterm.css'

import '@fontsource/cascadia-code/400.css'
import '@fontsource/cascadia-code/700.css'

import '../style.css'

export default function Logs({ routeKey }: { routeKey: RouteKey }) {
  const logsRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const autoScroll = store.logsAutoScroll.use() ?? false
  const [hasLogs, setHasLogs] = useState(false)

  const isProxmox = store.routeDetails[routeKey]!.proxmox.useCompute(proxmox => Boolean(proxmox))

  const onLog = useCallback(() => {
    setHasLogs(true)
  }, [])

  return (
    <div className="relative">
      <Suspense>
        <LogProvider
          key={routeKey}
          routeKey={routeKey}
          termRef={termRef}
          autoScroll={autoScroll}
          isProxmox={isProxmox}
          onLog={onLog}
        />
      </Suspense>
      <LogsInner
        key={routeKey}
        routeKey={routeKey}
        logsRef={logsRef}
        termRef={termRef}
        hasLogs={hasLogs}
        setHasLogs={setHasLogs}
      />
    </div>
  )
}

function LogsInner({
  routeKey,
  logsRef,
  termRef,
  hasLogs,
  setHasLogs,
}: {
  routeKey: RouteKey
  logsRef: React.RefObject<HTMLDivElement | null>
  termRef: React.RefObject<Terminal | null>
  hasLogs: boolean
  setHasLogs: (hasLogs: boolean) => void
}) {
  'use memo'

  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const fitAddonRef = useRef<FitAddon | null>(null)

  // Reset hasLogs when route changes
  useLayoutEffect(() => {
    setHasLogs(false)
  }, [routeKey, setHasLogs])

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
      setScrollDirection(prev => (prev === next ? prev : next))
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
        theme: {
          background: 'transparent',
          foreground: '#ffffff',
        },
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
  }, [logsRef, termRef])

  useEffect(() => {
    const term = termRef.current
    if (term) {
      term.reset()
      term.clear()
    }
  }, [routeKey, termRef])

  return (
    <>
      <div className="relative h-full max-h-[45vh] overflow-hidden rounded-md border bg-muted/30 tracking-normal">
        <div ref={logsRef} className="container-logs-terminal h-full w-full" />
        {!hasLogs && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingRing />
          </div>
        )}
      </div>
      <div className="absolute bottom-2 right-2">
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
    </>
  )
}

function LogChevron({ direction }: { direction: 'up' | 'down' }) {
  return direction === 'up' ? <IconChevronUp /> : <IconChevronDown />
}

function LogProvider({
  routeKey,
  termRef,
  autoScroll,
  isProxmox,
  onLog,
}: {
  routeKey: RouteKey
  termRef: React.RefObject<Terminal | null>
  autoScroll: boolean
  isProxmox: boolean
  onLog: () => void
}) {
  const proxmox = store.routeDetails[routeKey]!.proxmox.use()
  const containerId = store.routeDetails[routeKey]!.container.useCompute(
    container => container?.container_id
  )

  const endpoint = useMemo(() => {
    if (containerId) {
      return `/docker/logs/${containerId}`
    } else if (proxmox && proxmox.node) {
      let basePath = `/proxmox/journalctl/${proxmox.node}`
      if (proxmox.vmid) {
        basePath += `/${proxmox.vmid}`
      }
      if (proxmox.service) {
        basePath += `/${proxmox.service}`
      }
      return basePath
    }
    return ''
  }, [containerId, proxmox])

  const containerIdRef = useRef(containerId)
  const autoScrollRef = useRef(autoScroll)

  useEffect(() => {
    autoScrollRef.current = autoScroll
  }, [autoScroll])

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

    const parseTimestamp = !isProxmox
    for (const line of batch) {
      term.writeln(formatLineForTerminal(line, parseTimestamp, isProxmox))
    }

    onLog()

    if (autoScrollRef.current) {
      term.scrollToBottom()
    }
  }, [termRef, isProxmox, onLog])

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
        term.writeln(formatLineForTerminal(`${new Date().toISOString()} No logs available`, true))
        onLog()
      }
    }
  }, [endpoint, termRef, onLog])

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

function formatLineForTerminal(line: string, parseTimestamp: boolean, isProxmox: boolean = false) {
  const firstSpace = parseTimestamp ? line.indexOf(' ') : -1
  const timestamp = firstSpace === -1 ? '' : line.slice(0, firstSpace)
  const date = timestamp ? new Date(timestamp) : null
  const dateMs = date ? date.getTime() : Number.NaN
  const hasDate = date != null && !Number.isNaN(dateMs)

  const content = hasDate ? stripTimestampPrefix(line.slice(timestamp.length + 1)) : line

  // For Proxmox journalctl logs, try to parse the journalctl format (e.g., "Jan 25 14:55:23")
  if (!hasDate && isProxmox) {
    const journalDate = parseJournalctlTimestamp(line)
    if (journalDate) {
      return `\u001b[37m${formatLocalDateTime(journalDate)}\u001b[0m ${colorizeLogLevel(stripTimestampPrefix(line))}`
    }
  }

  if (!hasDate) {
    return colorizeLogLevel(content)
  }

  // Prepend a static timestamp. Use ANSI dim for readability without changing log colors.
  return `\u001b[37m${formatLocalDateTime(date)}\u001b[0m ${colorizeLogLevel(content)}`
}

function colorizeLogLevel(line: string): string {
  // ANSI color codes
  const colors = {
    reset: '\u001b[0m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    dim: '\u001b[2m',
    brightRed: '\u001b[91m',
    brightGreen: '\u001b[92m',
    brightYellow: '\u001b[93m',
  }

  // Log level patterns - case insensitive
  const patterns: { regex: RegExp; color: string }[] = [
    { regex: /\[(FATAL|CRITICAL)\]/gi, color: colors.brightRed },
    { regex: /\[(ERROR|ERR|SEVERE)\]/gi, color: colors.red },
    { regex: /\[(WARN|WARNING)\]/gi, color: colors.yellow },
    { regex: /\[(INFO|INFORMATION)\]/gi, color: colors.green },
    { regex: /\[(DEBUG|DBG)\]/gi, color: colors.blue },
    { regex: /\[(TRACE|TRC)\]/gi, color: colors.dim },
    { regex: /\[(SUCCESS|OK|PASS)\]/gi, color: colors.brightGreen },
    // JSON-style: "level":"debug"
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(fatal|critical)"/gi, color: colors.brightRed },
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(error|err|severe)"/gi, color: colors.red },
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(warn|warning)"/gi, color: colors.yellow },
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(info|information)"/gi, color: colors.green },
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(debug|dbg)"/gi, color: colors.blue },
    { regex: /"(?:level|loglevel|severity)"\s*:\s*"(trace|trc)"/gi, color: colors.dim },
    {
      regex: /"(?:level|loglevel|severity)"\s*:\s*"(success|ok|pass)"/gi,
      color: colors.brightGreen,
    },
  ]

  let result = line
  for (const { regex, color } of patterns) {
    result = result.replace(regex, `${color}$&${colors.reset}`)
  }

  return result
}

function formatLocalDateTime(date: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

const timePart =
  '\\d{1,2}:\\d{1,2}(?::\\d{1,2})?(?:[.,]\\d+)?(?:\\s*[ap]m)?(?:\\s*(?:Z|[+-]\\d{2}:?\\d{2}|UTC|GMT))?'
const dateYmd = '\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}'
const dateDmy = '\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}'
const dateMd = '\\d{1,2}[-/.]\\d{1,2}'
const timestampPrefix = new RegExp(
  `^(?:\\u001b\\[[0-9;]*m)*(?:\\[\\s*\\]\\s*)?(?:\\[\\s*|\\(\\s*)?(?:${dateYmd}[T ,]+${timePart}|${dateYmd}|${dateDmy}(?:[ T,]+${timePart})?|${dateMd}(?:[ T,]+${timePart})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}\\s+${timePart}(?:\\s+\\d{4})?|${timePart})(?:\\s*(?:\\]|\\)))?(?:\\u001b\\[[0-9;]*m)*\\s*`,
  'i'
)

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const journalctlRegex = /^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/

function parseJournalctlTimestamp(line: string): Date | null {
  const match = line.match(journalctlRegex)
  if (!match) return null

  const [, month, dayStr, hourStr, minuteStr, secondStr] = match

  const monthIndex = monthNames.indexOf(month!)
  if (monthIndex === -1) return null

  const now = new Date()
  const year = now.getFullYear()

  const date = new Date(
    year,
    monthIndex,
    parseInt(dayStr!, 10),
    parseInt(hourStr!, 10),
    parseInt(minuteStr!, 10),
    parseInt(secondStr!, 10)
  )

  // Handle year wrap-around (log from January when current month is later)
  if (date > now && now.getMonth() < monthIndex) {
    date.setFullYear(year - 1)
  }

  return date
}

function stripTimestampPrefix(line: string) {
  if (line.startsWith('{')) {
    // json
    return line
  }
  return line.replace(timestampPrefix, '')
}
