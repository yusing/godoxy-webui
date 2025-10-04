import LoadingRing from '@/components/LoadingRing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWebSocketApi } from '@/hooks/websocket'
import { cn } from '@/lib/utils'
import Convert from 'ansi-to-html'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useList } from 'react-use'
import { store } from '../store'

const convertANSI = new Convert()

type LogLine = { id: number; content: string }

export default function ContainerLogs({ containerId }: { containerId: string }) {
  const [lines, { push, reset }] = useList<LogLine>()
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const autoScroll = store.logsAutoScroll.use() ?? false
  const scrollDirection = useRef<'up' | 'down'>('down')

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
    idRef.current = 0
    reset()
  }, [containerId, reset])

  return (
    <div className="relative">
      <LogProvider
        containerId={containerId}
        push={push}
        idRef={idRef}
        autoScroll={autoScroll}
        logsRef={logsRef}
      />
      <div className="flex flex-col gap-1 overflow-auto h-full max-h-[45vh]" ref={logsRef}>
        <div ref={topRef} />
        {lines.length === 0 ? (
          <div className="flex items-center justify-center">
            <LoadingRing />
          </div>
        ) : (
          lines.map(line => <LogEntry key={line.id} line={line} />)
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
          {scrollDirection.current === 'up' ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
      </div>
    </div>
  )
}

function LogProvider({
  containerId,
  push,
  idRef,
  autoScroll,
  logsRef,
}: {
  containerId: string
  push: (data: LogLine) => void
  idRef: React.RefObject<number>
  autoScroll: boolean
  logsRef: React.RefObject<HTMLDivElement | null>
}) {
  const handlePush = useCallback(
    (data: LogLine) => {
      push(data)
      if (autoScroll) {
        const logsContainer = logsRef.current
        if (logsContainer) {
          logsContainer.scrollTo({ top: logsContainer.scrollHeight, behavior: 'smooth' })
        }
      }
    },
    [push, autoScroll, logsRef]
  )

  useWebSocketApi<string>({
    endpoint: `/docker/logs/${containerId}`,
    json: false,
    onMessage: data => {
      handlePush({ id: idRef.current++, content: data })
    },
    onError: error => {
      handlePush({ id: idRef.current++, content: `${new Date().toISOString()} ${error}` })
    },
  })

  return null
}

function LogEntry({ line }: { line: LogLine }) {
  const parsedLine = useMemo(() => parseLogLine(line.content), [line.content])
  const lineHTML = useMemo(() => convertANSI.toHtml(parsedLine.content), [parsedLine.content])

  return (
    <div className={cn('w-full font-mono', 'flex gap-2', line.id % 2 && 'bg-muted')}>
      <Badge className="min-w-fit" variant={'outline'}>
        {parsedLine.time}
      </Badge>
      <pre
        className="whitespace-pre-wrap text-wrap text-xs"
        dangerouslySetInnerHTML={{ __html: lineHTML }}
      />
    </div>
  )
}

// 2025-02-19T17:06:57.726414698Z [xxx] 2025/02/19 17:06:57 xxxx
const parseLogLine = (line: string) => {
  const [timestamp] = line.split(' ', 1)
  const date = new Date(timestamp!)
  return {
    time: date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    content: stripTimestamp(line.slice(timestamp!.length + 1)),
  }
}

function stripTimestamp(line: string) {
  if (line.startsWith('{')) {
    // json
    return line
  }
  return (
    line
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d*)?Z/, '')
      .replace(
        // eslint-disable-next-line no-control-regex
        /(?:\u001b\[\d{2}m)?(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})[,\s]*/,
        ''
      )
      // eslint-disable-next-line no-control-regex
      .replace(/(?:\d{1,2}:\d{1,2}(?::\d{1,2})?\s*(?:[ap]m)?(?:\u001b\[32m)?)(?:[.,]\d*)?/i, '')
      .replace('[]', '')
  )
}
