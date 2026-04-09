// @ts-nocheck
export type UseWebSocketExport = (typeof import('react-use-websocket'))['default']

export type ReactUseWebSocketModule = typeof import('react-use-websocket') & {
  useWebSocket?: UseWebSocketExport
  default?: UseWebSocketExport | ReactUseWebSocketModule
}

export function resolveUseWebSocketExport(module: ReactUseWebSocketModule) {
  const candidates = [
    module,
    module.default,
    module.useWebSocket,
    typeof module.default === 'object' && module.default !== null
      ? module.default.default
      : undefined,
    typeof module.default === 'object' && module.default !== null
      ? module.default.useWebSocket
      : undefined,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate
    }
  }

  throw new TypeError('react-use-websocket did not expose a callable useWebSocket export')
}
