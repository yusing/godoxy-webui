import * as reactUseWebSocketModule from 'react-use-websocket'
import { resolveUseWebSocketExport } from '@/lib/react-use-websocket.internal'

export const useWebSocket = resolveUseWebSocketExport(reactUseWebSocketModule)
export const { ReadyState } = reactUseWebSocketModule
