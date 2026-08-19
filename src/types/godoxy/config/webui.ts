import type { FileServerRoute, RouteRule } from '../providers/routes'

export type WebUIConfig = {
  /** Name shown for this GoDoxy instance in the WebUI server list and headings
   *
   * @default "GoDoxy"
   */
  display_name?: string
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
