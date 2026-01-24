import LoadingRing from '@/components/LoadingRing'
import { Button } from '@/components/ui/button'
import { useWebSocketApi } from '@/hooks/websocket'
import { formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import Convert from 'ansi-to-html'
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useList } from 'react-use'
import { store } from '../store'

const convertANSI = new Convert()

export default function ContainerLogs({ containerId }: { containerId: string }) {
  const [lines, { push, reset }] = useList<string>()
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  const autoScroll = store.logsAutoScroll.use() ?? false
  const scrollDirection = useRef<'up' | 'down'>('down')

  useEffect(() => {
    if (!autoScroll) return
    const anchor = bottomRef.current
    if (!anchor) return

    // Avoid `behavior: 'smooth'` here: log streaming causes repeated effects
    // which will interrupt the animation and often land mid-way.
    const raf = requestAnimationFrame(() => {
      anchor.scrollIntoView({ block: 'end', behavior: 'auto' })
    })
    return () => cancelAnimationFrame(raf)
  }, [autoScroll, containerId, lines.length])

  useEffect(() => {
    const logs = logsRef.current
    const calcChevronShouldUp = () => {
      if (!logs) {
        return
      }
      scrollDirection.current = logs.scrollTop >= logs.scrollHeight / 2 ? 'up' : 'down'
    }
    logs?.addEventListener('scroll', calcChevronShouldUp)

    return () => {
      logs?.removeEventListener('scroll', calcChevronShouldUp)
    }
  }, [logsRef])

  useEffect(() => {
    reset()
  }, [containerId, reset])

  return (
    <div className="relative">
      <Suspense>
        <LogProvider containerId={containerId} push={push} />
      </Suspense>
      <ContainerLogsInner
        lines={lines}
        logsRef={logsRef}
        topRef={topRef}
        bottomRef={bottomRef}
        scrollDirection={scrollDirection}
      />
    </div>
  )
}

function ContainerLogsInner({
  lines,
  logsRef,
  topRef,
  bottomRef,
  scrollDirection,
}: {
  lines: string[]
  logsRef: React.RefObject<HTMLDivElement | null>
  topRef: React.RefObject<HTMLDivElement | null>
  bottomRef: React.RefObject<HTMLDivElement | null>
  scrollDirection: React.RefObject<'up' | 'down'>
}) {
  'use memo'

  return (
    <>
      <div className="flex flex-col gap-1 overflow-auto h-full max-h-[45vh]" ref={logsRef}>
        <div ref={topRef} />
        {lines.length === 0 ? (
          <div className="flex items-center justify-center">
            <LoadingRing />
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-1">
            {lines.map((line, index) => (
              <LogEntry key={index} line={line} index={index} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="absolute bottom-2 right-2">
        <Button
          size="icon"
          className="bg-teal-500 text-white"
          aria-label="Scroll to bottom"
          onClick={() => {
            const logsContainer = logsRef.current
            if (!logsContainer) return

            if (scrollDirection.current === 'up') {
              logsContainer.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
              logsContainer.scrollTo({ top: logsContainer.scrollHeight, behavior: 'smooth' })
            }
          }}
        >
          <LogChevron direction={scrollDirection} />
        </Button>
      </div>
    </>
  )
}

function LogChevron({ direction }: { direction: React.RefObject<'up' | 'down'> }) {
  const [currentDirection, setCurrentDirection] = useState<'up' | 'down'>('down')
  useEffect(() => {
    setCurrentDirection(direction.current)
  }, [direction])
  return currentDirection === 'up' ? <IconChevronUp /> : <IconChevronDown />
}

function LogProvider({
  containerId,
  push,
}: {
  containerId: string
  push: (...data: string[]) => void
}) {
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

    const batch = pendingLinesRef.current
    pendingLinesRef.current = []
    push(...batch)
  }, [push])

  const scheduleFlush = useCallback(() => {
    // Aggregate multiple websocket messages into a single list push.
    // Throttle interval is intentionally small to keep UI responsive.
    const throttleMs = 75
    if (flushTimeoutRef.current) return
    flushTimeoutRef.current = setTimeout(flush, throttleMs)
  }, [flush])

  const enqueue = useCallback(
    (data: string) => {
      pendingLinesRef.current.push(data)
      scheduleFlush()
    },
    [scheduleFlush]
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

  useWebSocketApi<string>({
    endpoint: `/docker/logs/${containerId}`,
    json: false,
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

function LogEntry({ line, index }: { line: string; index: number }) {
  'use memo'
  const firstSpace = line.indexOf(' ')
  const timestamp = firstSpace === -1 ? '' : line.slice(0, firstSpace)
  const date = timestamp ? new Date(timestamp) : null
  const content = date ? stripTimestampPrefix(line.slice(timestamp.length + 1)) : line
  const lineHTML = useMemo(() => convertANSI.toHtml(content), [content])

  return (
    <>
      <FormattedDate dateMs={date?.getTime() ?? null} />
      <pre
        className={cn(
          'whitespace-pre-wrap text-wrap text-xs leading-none font-mono font-medium h-full flex items-center px-2',
          index % 2 && 'bg-muted'
        )}
        dangerouslySetInnerHTML={{ __html: lineHTML }}
      />
    </>
  )
}

function FormattedDate({ dateMs }: { dateMs: number | null }) {
  const formattedDate = useFormattedDate(dateMs)
  return (
    <span className="font-mono font-medium h-min py-0.5 text-xs w-full text-right text-nowrap">
      {formattedDate}
    </span>
  )
}

/**
 * Hook that formats a date as a dynamic relative time string, updating
 * frequently to stay current as time passes.
 *
 * The update interval adapts based on how far the given date is from "now":
 * - Under 60 seconds   → updates every 1 second
 * - Under 60 minutes   → updates every 10 seconds
 * - Under 24 hours     → updates every 1 minute
 * - Under 7 days       → updates every 10 minutes
 * - Older              → updates every 1 hour
 *
 * The hook keeps the formatted value in local state, and internally
 * reschedules the next update with setTimeout to avoid unnecessary renders.
 * On cleanup, it clears any scheduled timeout.
 */
const useFormattedDate = (dateMs: number | null) => {
  const [formattedDate, setFormattedDate] = useState('')
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if (dateMs == null || Number.isNaN(dateMs)) {
        setFormattedDate('')
        return
      }
      const now = new Date()
      const diffSeconds = Math.abs(now.getTime() - dateMs) / 1000
      let intervalMs = 1000
      if (diffSeconds < 60) {
        intervalMs = 1000
      } else if (diffSeconds < 60 * 60) {
        intervalMs = 10_000
      } else if (diffSeconds < 60 * 60 * 24) {
        intervalMs = 60_000
      } else if (diffSeconds < 60 * 60 * 24 * 7) {
        intervalMs = 10 * 60_000
      } else {
        intervalMs = 60 * 60_000
      }
      setFormattedDate(formatRelTime(dateMs, now))
      timeoutId = setTimeout(schedule, intervalMs)
    }
    schedule()
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [dateMs])
  return formattedDate
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

function stripTimestampPrefix(line: string) {
  if (line.startsWith('{')) {
    // json
    return line
  }
  return line.replace(timestampPrefix, '')
}
