import type { URL } from '../types'

export type ProxmoxConfig = {
  /**
   * API URL
   *
   * @examples ["https://proxmox.example.com:8006/api/json2"]
   */
  url: URL
  /**
   * Token ID
   */
  token_id: string
  /**
   * API secret
   */
  secret: string
  /**
   * Skip TLS verification
   */
  no_tls_verify?: boolean
}
