import { logger } from "@/lib/logger";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-use";
import useWebSocket, { ReadyState } from "react-use-websocket";

// Generic WebSocket API hook
export type WebSocketApiOptions<TMessage, TSubscription = unknown> = {
  /** WebSocket endpoint path (e.g., '/feed/subscribe') */
  endpoint: string;
  /** Query parameters to append to the endpoint */
  query?: Record<string, string | number>;
  /** Whether the WebSocket message is JSON */
  json?: boolean;
  /** Whether the WebSocket should connect */
  shouldConnect?: boolean;
  /** Callback for handling incoming messages */
  onMessage: (data: TMessage) => void;
  /** Optional subscription data to send when connected */
  subscriptionData?: TSubscription;
  /** Optional callback for connection open */
  onOpen?: () => void;
  /** Optional callback for connection close */
  onClose?: (event: CloseEvent) => void;
  /** Optional callback for connection error */
  onError?: (error: string) => void;
  /** Number of reconnection attempts (default: 3) */
  reconnectAttempts?: number;
  /** Function to calculate reconnection interval (default: exponential backoff) */
  reconnectInterval?: (attemptNumber: number) => number;
};

const HEARTBEAT_INTERVAL = 3000 as const;
const HEARTBEAT_TIMEOUT = 8000 as const;

export function useWebSocketApi<TMessage, TSubscription = any>({
  endpoint,
  query,
  json = true,
  shouldConnect = true,
  onMessage,
  subscriptionData,
  onOpen,
  onClose,
  onError,
  reconnectAttempts = 3,
  reconnectInterval = (numAttempts: number) =>
    Math.min(1000 * Math.pow(2, numAttempts), 10000), // exponential backoff, max 10s
}: WebSocketApiOptions<TMessage, TSubscription>) {
  const [dataSent, setDataSent] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const location = useLocation();
  const lastHeartbeat = useRef(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Create WebSocket URL
  const getSocketUrl = useCallback(() => {
    if (!shouldConnect) {
      return null;
    }

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${location.host}/api/v1${endpoint}`;
  }, [endpoint, shouldConnect, location]);

  // Handle connection open
  const handleOpen = useCallback(() => {
    logger.debug(`WebSocket connected to ${endpoint}`);
    setConnectionError(null);
    setDataSent(false); // Reset data sent flag on new connection
    lastHeartbeat.current = Date.now(); // Reset heartbeat on connection
    isConnectedRef.current = true;
    onOpen?.();
  }, [endpoint, onOpen]);

  // Handle connection close
  const handleClose = useCallback(
    (event: CloseEvent) => {
      logger.debug(
        `WebSocket disconnected from ${endpoint}:`,
        event.code,
        event.reason,
      );
      setDataSent(false);
      isConnectedRef.current = false;

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Handle different close codes
      if (event.code === 1000) {
        // Normal closure
        handleError(null);
      } else if (event.code === 1006) {
        // Abnormal closure (likely network issue or server disconnect)
        handleError("Connection lost unexpectedly");
      } else {
        handleError(`Connection closed: ${event.reason || "Unknown reason"}`);
      }

      onClose?.(event);
    },
    [endpoint, onClose],
  );

  // Handle errors
  const handleEventError = useCallback(
    (error: Event) => {
      setConnectionError("WebSocket connection error");
      logger.error("WebSocket error", error);
      onError?.(error.toString());
    },
    [onError],
  );

  const handleError = useCallback(
    (error: string | null) => {
      setConnectionError(error);
      if (error) {
        logger.error("WebSocket error", error);
        onError?.(error);
      }
    },
    [onError],
  );

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data === "pong") {
        lastHeartbeat.current = Date.now();
        return;
      }
      try {
        const data: TMessage = json
          ? JSON.parse(event.data)
          : (event.data as string);
        onMessage(data);
        // Clear any previous connection errors on successful message
        setConnectionError(null);
      } catch (error) {
        handleError(
          `Failed to parse WebSocket message on ${endpoint}: ${error}`,
        );
      }
    },
    [endpoint, onMessage, json, handleError],
  );

  // Use WebSocket hook with enhanced configuration
  const { sendJsonMessage, sendMessage, readyState, getWebSocket } =
    useWebSocket<TMessage>(
      getSocketUrl(),
      {
        queryParams: query,
        onOpen: handleOpen,
        onClose: handleClose,
        onError: handleEventError,
        onMessage: handleMessage,
        shouldReconnect: (closeEvent) => {
          // Only reconnect on unexpected disconnections and if we should still be connected
          return shouldConnect && closeEvent.code !== 1000;
        },
        reconnectAttempts,
        reconnectInterval,
        retryOnError: true,
        onReconnectStop: (numAttempts) => {
          handleError(`Failed to reconnect after ${numAttempts} attempts`);
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
      shouldConnect,
    );

  // Send subscription message when connected and subscription data changes
  useEffect(() => {
    if (readyState === ReadyState.OPEN && subscriptionData && !dataSent) {
      try {
        sendJsonMessage(subscriptionData);
        setDataSent(true);
        logger.debug(
          `WebSocket subscription message sent on ${endpoint}:`,
          subscriptionData,
        );
      } catch (error) {
        handleError(
          `Failed to send subscription message on ${endpoint}: ${error}`,
        );
      }
    }
    if (readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING) {
      setDataSent(false);
    }
  }, [
    readyState,
    subscriptionData,
    sendJsonMessage,
    endpoint,
    dataSent,
    handleError,
  ]);

  // heartbeat
  useEffect(() => {
    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Only start heartbeat if connected
    if (readyState !== ReadyState.OPEN) {
      isConnectedRef.current = false;
      return;
    }

    isConnectedRef.current = true;
    lastHeartbeat.current = Date.now(); // Reset heartbeat when starting

    heartbeatIntervalRef.current = setInterval(() => {
      // Check if we're still connected
      if (!isConnectedRef.current || readyState !== ReadyState.OPEN) {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        return;
      }

      const now = Date.now();
      const timeSinceLastHeartbeat = now - lastHeartbeat.current;

      if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
        logger.warn(`Heartbeat timeout after ${timeSinceLastHeartbeat}ms`);
        handleError("Heartbeat timeout");
        getWebSocket()?.close();
        return;
      }

      try {
        sendMessage("ping");
      } catch (error) {
        logger.error("Failed to send heartbeat ping:", error);
        handleError("Failed to send heartbeat");
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [readyState, sendMessage, getWebSocket, handleError]);

  return {
    sendJsonMessage,
    sendMessage,
    readyState,
    connectionError,
  };
}
