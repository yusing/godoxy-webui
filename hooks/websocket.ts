'use client'

import { logger } from '@/lib/logger'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import isEqual from 'react-fast-compare'
import { useLocation } from 'react-use'
import useWebSocket, { ReadyState } from 'react-use-websocket'

// Generic WebSocket API hook
export type WebSocketApiOptions<TMessage, TSubscription = unknown> = {
  /** WebSocket endpoint path (e.g., '/feed/subscribe') */
  endpoint: string
  /** Query parameters to append to the endpoint */
  query?: Record<string, string | number>
  /** Whether the WebSocket message is JSON */
  json?: boolean
  /** Whether to use HTTP for the initial data fetch */
  httpAsInitial?: boolean
  /** Whether to deduplicate messages */
  deduplicate?: boolean
  /** Whether the WebSocket should connect */
  shouldConnect?: boolean
  /** Callback for handling incoming messages */
  onMessage: (data: TMessage) => void
  /** Optional subscription data to send when connected */
  subscriptionData?: TSubscription
  /** Optional callback for connection open */
  onOpen?: () => void
  /** Optional callback for connection close */
  onClose?: (event: CloseEvent) => void
  /** Optional callback for connection error */
  onError?: (error: string) => void
  /** Number of reconnection attempts (default: 3) */
  reconnectAttempts?: number
  /** Function to calculate reconnection interval (default: exponential backoff) */
  reconnectInterval?: (attemptNumber: number) => number
}

const HEARTBEAT_INTERVAL = 2000 as const
const HEARTBEAT_TIMEOUT = 8000 as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWebSocketApi<TMessage, TSubscription = any>({
  endpoint,
  query,
  json = true,
  httpAsInitial = false,
  deduplicate = true,
  shouldConnect = true,
  onMessage,
  subscriptionData,
  onOpen,
  onClose,
  onError,
  reconnectAttempts = 10,
  reconnectInterval = (numAttempts: number) => Math.min(1000 * Math.pow(2, numAttempts), 5000), // exponential backoff, max 5s
}: WebSocketApiOptions<TMessage, TSubscription>) {
  const dataSent = useRef(false)
  const lastHeartbeat = useRef(Date.now())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageRef = useRef<TMessage | null>(null)
  const location = useLocation()

  // Create WebSocket URL
  const socketURL = useMemo(() => {
    if (!shouldConnect) {
      return null
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${location.host}/api/v1${endpoint}`
  }, [endpoint, shouldConnect, location])

  // Handle connection open
  const handleOpen = useCallback(() => {
    logger.debug(`WebSocket connected to ${endpoint}`)
    dataSent.current = false // Reset data sent flag on new connection
    lastHeartbeat.current = Date.now() // Reset heartbeat on connection
    onOpen?.()
  }, [endpoint, onOpen])

  const handleError = useCallback(
    (error: string | null) => {
      if (error) {
        logger.error('WebSocket error', error)
        onError?.(error)
      }
    },
    [onError]
  )

  // Handle connection close
  const handleClose = useCallback(
    (event: CloseEvent) => {
      logger.debug(`WebSocket disconnected from ${endpoint}:`, event.code, event.reason)
      dataSent.current = false

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      // Handle different close codes
      if (event.code === 1000) {
        // Normal closure
        handleErrorRef.current?.(null)
      } else if (event.code === 1006) {
        // Abnormal closure (likely network issue or server disconnect)
        handleErrorRef.current?.('Connection lost unexpectedly')
      } else {
        handleErrorRef.current?.(`Connection closed: ${event.reason || 'Unknown reason'}`)
      }

      onClose?.(event)
    },
    [endpoint, onClose]
  )

  // Handle errors
  const handleEventError = useCallback(
    (error: Event) => {
      logger.error('WebSocket error', error)
    },
    []
  )

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data === 'pong') {
        lastHeartbeat.current = Date.now()
        return
      }
      try {
        const data: TMessage = json ? JSON.parse(event.data) : (event.data as string)
        if (!deduplicate || !isEqual(data, lastMessageRef.current)) {
          lastMessageRef.current = data
          onMessage(data)
        }
        // Treat any incoming message as a heartbeat
        lastHeartbeat.current = Date.now()
      } catch (error) {
        handleErrorRef.current?.(`Failed to parse WebSocket message on ${endpoint}: ${error}`)
      }
    },
    [endpoint, onMessage, json, deduplicate]
  )

  // Fetch initial data via HTTP using the same URL and query as socketURL
  useEffect(() => {
    if (!socketURL || !httpAsInitial) {
      return
    }

    const controller = new AbortController()
    const fetchInitialData = async () => {
      try {
        const wsUrl = newURL(socketURL, query)
        // Swap ws/wss to http/https for the initial HTTP request
        wsUrl.protocol = wsUrl.protocol === 'wss:' ? 'https:' : 'http:'

        const response = await fetch(wsUrl.toString(), {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            Accept: 'application/json, text/plain;q=0.9,*/*;q=0.8',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`)
        }

        const payload = json ? await response.json() : await response.text()

        // Set last message to leverage deduplication with subsequent WS messages
        lastMessageRef.current = payload
        onMessage(payload)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        handleErrorRef.current?.(`Failed to fetch initial data from ${endpoint}: ${error}`)
      }
    }

    fetchInitialData()
    return () => controller.abort()
  }, [query, socketURL, json, onMessage, endpoint, httpAsInitial])

  // Use WebSocket hook with enhanced configuration
  const { sendJsonMessage, sendMessage, readyState, getWebSocket } = useWebSocket<TMessage>(
    socketURL,
    {
      queryParams: query,
      share: false,
      onOpen: handleOpen,
      onClose: handleClose,
      onError: handleEventError,
      onMessage: handleMessage,
      shouldReconnect: closeEvent => {
        // Only reconnect on unexpected disconnections and if we should still be connected
        return shouldConnect && closeEvent.code !== 1000
      },
      reconnectAttempts,
      reconnectInterval,
      retryOnError: true,
      onReconnectStop: numAttempts => {
        handleErrorRef.current?.(`Failed to reconnect after ${numAttempts} attempts`)
      },
      // Enable heartbeat for automatic ping-pong handling
      // Replaced with custom heartbeat handling for now, it's not working as expected
      // heartbeat: {
      //   message: "ping",
      //   returnMessage: "pong",
      //   timeout: 5000,
      //   interval: 3000, // 3 seconds - slightly less than backend ping interval
      // },

      // use custom message handling
      disableJson: true,
    },
    shouldConnect
  )

  // Keep latest function references stable for heartbeat effect
  const sendMessageRef = useRef(sendMessage)
  const sendJsonMessageRef = useRef(sendJsonMessage)
  const getWebSocketRef = useRef(getWebSocket)
  const handleErrorRef = useRef(handleError)

  useEffect(() => {
    sendMessageRef.current = sendMessage
  }, [sendMessage])

  useEffect(() => {
    sendJsonMessageRef.current = sendJsonMessage
  }, [sendJsonMessage])

  useEffect(() => {
    getWebSocketRef.current = getWebSocket
  }, [getWebSocket])

  useEffect(() => {
    handleErrorRef.current = handleError
  }, [handleError])

  // Send subscription message when connected and subscription data changes
  useEffect(() => {
    if (readyState === ReadyState.OPEN && subscriptionData && !dataSent.current) {
      try {
        sendJsonMessageRef.current?.(subscriptionData)
        dataSent.current = true
        logger.debug(`WebSocket subscription message sent on ${endpoint}:`, subscriptionData)
      } catch (error) {
        handleErrorRef.current?.(`Failed to send subscription message on ${endpoint}: ${error}`)
      }
    }
    if (readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING) {
      dataSent.current = false
    }
  }, [readyState, subscriptionData, endpoint])

  // heartbeat
  useEffect(() => {
    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    // Only start heartbeat if connected
    if (readyState !== ReadyState.OPEN) {
      return
    }

    lastHeartbeat.current = Date.now() // Reset heartbeat when starting

    heartbeatIntervalRef.current = setInterval(() => {
      // Check if we're still connected
      if (readyState !== ReadyState.OPEN) {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }
        return
      }

      const now = Date.now()
      const timeSinceLastHeartbeat = now - lastHeartbeat.current

      if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
        handleErrorRef.current?.(`Heartbeat timeout after ${timeSinceLastHeartbeat}ms`)
        getWebSocketRef.current?.()?.close()
        return
      }

      try {
        sendMessageRef.current?.('ping')
      } catch (error) {
        handleErrorRef.current?.(`Failed to send heartbeat ping: ${formatError(error)}`)
      }
    }, HEARTBEAT_INTERVAL)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }
  }, [readyState])

  return {
    sendJsonMessage,
    sendMessage,
    readyState,
  }
}

function newURL(url: string, query?: Record<string, string | number>) {
  const urlObj = new URL(url)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value))
    })
  }
  return urlObj
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
