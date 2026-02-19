import {
  IconActivity,
  IconBox,
  IconFileUnknown,
  IconRoute,
  IconShieldLock,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useWebSocketApi } from '@/hooks/websocket'
import type { EventsLevel, HealthJSON, Route } from '@/lib/api'
import { formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { store } from './store'

export { EventsList, EventsWatcher }

type PoolAction = 'added' | 'removed' | 'reloaded'

type EventCommon = {
  level: EventsLevel
  timestamp: string
  uuid: string
  action: string
}

type Event = EventCommon &
  (
    | {
        category: 'health'
        action: 'service_down' | 'service_up'
        data: HealthJSON
      }
    | {
        category: 'acl_event'
        action: 'blocked'
        data: { ip: string; reason: string }
      }
    | {
        category: 'http_event'
        action: 'blocked'
        data: {
          remote_ip: string
          request_url: string
          source: string
          reason: string
        }
      }
    | {
        category: 'provider_event'
        action: string
        data: { provider: string; type: string; actor: string }
      }
    | {
        category: 'pool.proxmox_nodes'
        action: PoolAction
        data: { name: string; id: string }
      }
    | {
        category: 'pool.http_routes' | 'pool.stream_routes' | 'pool.excluded_routes'
        action: PoolAction
        data: Route
      }
  )

function EventsList() {
  const events = store.events.use() ?? []
  return (
    <Card className="h-full min-h-0 backdrop-blur bg-card/50 xl:shadow-none xl:bg-inherit xl:pt-0">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">Live activity</CardTitle>
        <CardDescription>Recent events and health signals</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="space-y-2 h-full overflow-y-auto px-1 -mx-1">
          {events.map(event => (
            <EventRow key={event.uuid} event={event as Event} />
          ))}
        </div>
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

  let icon: React.ReactNode
  let label: string
  switch (event.category) {
    case 'health':
      icon = <IconActivity className="size-3.5" />
      label = 'health'
      break
    case 'pool.proxmox_nodes':
    case 'pool.http_routes':
    case 'pool.stream_routes':
    case 'pool.excluded_routes':
      icon = <IconRoute className="size-3.5" />
      label = 'proxy'
      break
    case 'provider_event':
      icon = <IconBox className="size-3.5" />
      label = event.data.type // file / docker
      break
    case 'acl_event':
      icon = <IconShieldLock className="size-3.5" />
      label = 'acl'
      break
    case 'http_event':
      icon = <IconShieldLock className="size-3.5" />
      label = 'http'
      break
    default:
      icon = <IconFileUnknown className="size-3.5" />
      label = 'unknown'
  }

  return (
    <div
      data-slot="card"
      className="flex items-start justify-between gap-3 rounded-lg px-3 py-2 bg-card supports-backdrop-filter:bg-card/55 supports-backdrop-filter:backdrop-blur"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-info/20 text-info-foreground">
            {icon}
            {label}
          </Badge>
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
      return (
        <span>
          {event.data.name} <strong>({event.data.id})</strong> {event.action}
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
      return (
        <span>
          {type} <strong>{event.data.alias}</strong> {event.action}
        </span>
      )
    }
    case 'provider_event': {
      return (
        <div className="space-y-0.5">
          <span>
            <strong>{event.data.actor}</strong> {event.action}
          </span>
          <div className="text-xs text-muted-foreground wrap-break-word">
            Provider: {event.data.provider}
          </div>
        </div>
      )
    }
    case 'acl_event': {
      return (
        <div className="space-y-0.5">
          <span>
            IP Blocked <strong>{event.data.ip}</strong>
          </span>
          <div className="text-xs text-muted-foreground wrap-break-word">{event.data.reason}</div>
        </div>
      )
    }
    case 'http_event': {
      return (
        <div className="space-y-0.5">
          <span>
            {event.data.source} blocked <strong>{event.data.remote_ip}</strong>
          </span>
          <div className="text-xs text-muted-foreground wrap-break-word">
            to {event.data.request_url}
          </div>
          <div className="text-xs text-muted-foreground wrap-break-word">{event.data.reason}</div>
        </div>
      )
    }
    case 'health': {
      switch (event.action) {
        case 'service_down':
          return (
            <div className="space-y-0.5">
              <span>
                <strong>{event.data.name}</strong> went down
              </span>
              {event.data.detail ? (
                <div className="text-xs text-muted-foreground wrap-break-word">
                  {event.data.detail}
                </div>
              ) : null}
            </div>
          )
        case 'service_up':
          return (
            <span>
              <strong>{event.data.name}</strong> is up ({event.data.latency}ms)
            </span>
          )
      }
    }
  }

  return <span>Unknown health action {(event as EventCommon).action}</span>
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
