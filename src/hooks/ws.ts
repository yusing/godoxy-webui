import React, { useEffect } from "react";

// WebSocket connection manager
const wsConnections: Record<string, WebSocket> = {};
const wsSubscribers: Record<string, Set<(data: any) => void>> = {};

type Options = {
  json?: boolean;
};

export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

function getOrCreateWebSocket<T>(
  endpoint: string,
  options: Options,
): WebSocket {
  const { json = false } = options;
  if (!wsConnections[endpoint]) {
    const ws = new WebSocket(endpoint);
    wsConnections[endpoint] = ws;
    wsSubscribers[endpoint] = new Set();

    // Add beforeunload event listener to close connections cleanly
    window.addEventListener("beforeunload", () => {
      if (ws.readyState === ReadyState.OPEN) {
        // Use a clean close
        ws.close(1000, "Page closed");
      }
    });

    ws.onmessage = (event) => {
      let parsed: T | null = null;
      try {
        parsed = json ? JSON.parse(event.data) : event.data;
      } catch (e) {
        console.error(e);
      }
      wsSubscribers[endpoint]!.forEach((callback) => {
        callback(parsed);
      });
    };
  }
  return wsConnections[endpoint];
}

export default function useWebsocket<T>(endpoint: string, options?: Options) {
  const [data, setData] = React.useState<T | null>(null);
  const [readyState, setReadyState] = React.useState<number>(
    WebSocket.CONNECTING,
  );

  useEffect(() => {
    const ws = getOrCreateWebSocket(endpoint, options ?? {});
    const callback = (newData: T | null) => setData(newData);

    // Add subscriber
    wsSubscribers[endpoint]!.add(callback);

    // Update ready state
    const handleStateChange = () => setReadyState(ws.readyState);
    ws.addEventListener("open", handleStateChange);
    ws.addEventListener("close", handleStateChange);

    // Set initial ready state
    setReadyState(ws.readyState);

    return () => {
      wsSubscribers[endpoint]!.delete(callback);
      ws.removeEventListener("open", handleStateChange);
      ws.removeEventListener("close", handleStateChange);

      // Clean up connection if no more subscribers
      if (wsSubscribers[endpoint]!.size === 0) {
        ws.close();
        delete wsConnections[endpoint];
        delete wsSubscribers[endpoint];
      }
    };
  }, [endpoint]);

  return { data, readyState } as const;
}
