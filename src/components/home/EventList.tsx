import { Activity, Boxes, Cpu, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Event, EventsLevel, HealthJSON, Route } from '@/lib/api'
import { formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { store } from './store'

export { EventsList, EventsWatcher }

function EventsList() {
  const events = store.events.use() ?? []
  return (
    <Card className="h-full min-h-0 backdrop-blur bg-card/50 xl:bg-inherit xl:pt-0">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">Live activity</CardTitle>
        <CardDescription>Recent events and health signals</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-2">
            {events.map(event => (
              <EventRow key={event.uuid} event={event} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function levelClassname(level: EventsLevel) {
  switch (level) {
    case 'debug':
      return 'bg-muted text-muted-foreground'
    case 'info':
      return 'bg-muted text-muted-foreground'
    case 'warn':
      return 'bg-warning/20 text-warning-foreground'
    case 'error':
      return 'bg-destructive/15 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function EventRow({ event }: { event: Event }) {
  const isHealthServiceDown = event.category === 'health' && event.action === 'service_down'
  const kind =
    event.category === 'health' ? (
      <Badge variant="secondary" className="gap-1">
        <Activity className="size-3.5" />
        health
      </Badge>
    ) : event.category.startsWith('pool.') ? (
      <Badge variant="secondary" className="gap-1">
        <Layers className="size-3.5" />
        proxy
      </Badge>
    ) : event.category.includes('auth') ? (
      <Badge variant="secondary" className="gap-1">
        <Cpu className="size-3.5" />
        auth
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <Boxes className="size-3.5" />
        deploy
      </Badge>
    )

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg px-3 py-2 bg-card backdrop-blur">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {kind}
          <RelTimeBadge
            timestamp={new Date(event.timestamp)}
            level={event.level}
            destructive={isHealthServiceDown}
          />
        </div>
        <div className="text-sm leading-snug">
          <EventData event={event} />
        </div>
      </div>
    </div>
  )
}

function relTimeRefreshMs(timestamp: Date, now = Date.now()) {
  const diff = Math.abs(timestamp.getTime() - now)
  if (diff < 60 * 1000) return 1000
  if (diff < 60 * 60 * 1000) return 10 * 1000
  if (diff < 24 * 60 * 60 * 1000) return 60 * 1000
  return 10 * 60 * 1000
}

function RelTimeBadge({
  timestamp,
  level,
  destructive,
}: {
  timestamp: Date
  level: EventsLevel
  destructive: boolean
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setNow(Date.now())
      },
      relTimeRefreshMs(timestamp, now)
    )
    return () => clearTimeout(timeout)
  }, [now, timestamp])

  return (
    <Badge
      className={cn('font-medium uppercase', !destructive && levelClassname(level))}
      variant={destructive ? 'destructive' : 'secondary'}
    >
      {formatRelTime(timestamp, now)}
    </Badge>
  )
}

function EventData({ event }: { event: Event }) {
  switch (event.category) {
    case 'pool.proxmox_nodes': {
      const data = event.data as { name: string; id: string }
      return (
        <span>
          {data.name} <strong>({data.id})</strong> {event.action}
        </span>
      )
    }
    case 'pool.http_routes':
    case 'pool.stream_routes':
    case 'pool.excluded_routes': {
      const names = {
        'pool.http_routes': 'HTTP route',
        'pool.stream_routes': 'Stream route',
        'pool.excluded_routes': 'Excluded route',
      } as const
      const type = names[event.category]
      const data = event.data as Route
      return (
        <span>
          {type} <strong>{data.alias}</strong> {event.action}
        </span>
      )
    }
    case 'health':
      {
        const data = event.data as HealthJSON
        switch (event.action) {
          case 'service_down':
            return (
              <div>
                <span>
                  <strong>{data.name}</strong> went down
                </span>
                {data.detail ? (
                  <div className="mt-0.5 text-xs text-muted-foreground wrap-break-word">
                    {data.detail}
                  </div>
                ) : null}
              </div>
            )
          case 'service_up':
            return (
              <span>
                <strong>{data.name}</strong> is up ({data.latency}ms)
              </span>
            )
        }
      }
      return <span>Unknown health action {event.action}</span>
  }

  return null
}

function EventsWatcher() {
  useEffect(() => {
    store.events.reset()
  }, [])

  useWebSocketApi<Event>({
    endpoint: '/events',
    onMessage: data => {
      store.events.set(prev => [data, ...prev].slice(0, 50))
    },
  })
  return null
}
