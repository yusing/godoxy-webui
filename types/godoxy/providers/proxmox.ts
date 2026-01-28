import type { URL } from '../types'

export type ProxmoxConfig = {
  /**
   * API URL
   *
   * @examples ["https://proxmox.example.com:8006/api/json2"]
   */
  url: URL
  /**
   * Username
   *
   * @description Required for journalctl log streaming
   * @examples ["root"]
   */
  username?: string
  /**
   * Password
   *
   * @description Required for journalctl log streaming
   * @examples ["password"]
   */
  password?: string
  /**
   * Authentication realm
   *
   * @description Authentication realm
   * @default "pam"
   */
  realm?: string
  /**
   * Token ID
   *
   * @description API token ID, uses password authentication if not set
   * @examples ["root@pam!godoxy-token"]
   */
  token_id?: string
  /**
   * API secret
   *
   * @description API secret, uses password authentication if not set
   * @examples ["secret"]
   */
  secret?: string
  /**
   * Skip TLS verification
   */
  no_tls_verify?: boolean
}

export type ProxmoxRouteConfig = {
  /**
   * Node name
   * @examples ["pve"]
   */
  node: string
  /**
   * VMID
   * @examples [119]
   */
  vmid?: number
  /**
   * Service names
   * @examples ["nginx"]
   */
  services?: string[]
  /**
   * Log files
   * @examples ["/var/log/nginx/access.log"]
   */
  files?: string[]
}
