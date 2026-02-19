import type { Terminal } from '@xterm/xterm'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { formatLineForTerminal } from '@/components/routes/content/logs'
import { store } from '@/components/routes/store'
import { useWebSocketApi } from '@/hooks/websocket'
import { Query } from '@/lib/query'
import type { RouteKey } from '../store'

export default function LogProvider({
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
    if (proxmox?.node) {
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
