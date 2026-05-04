import type { FileServerRoute, RouteRule } from '../providers/routes'

export type WebUIConfig = {
  /** WebUI aliases
   *
   * @default ["godoxy"]
   */
  aliases?: string[]
  /** Web UI rules
   *
   * Appended after the loaded rule file when set.
   */
  rules?: RouteRule[] | string
} & Pick<FileServerRoute, 'inbound_mtls_profile' | 'middlewares' | 'access_log'>
