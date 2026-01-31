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
   * @title Username
   * @description Required for journalctl log streaming
   * @examples ["root"]
   */
  username?: string
  /**
   * Password
   *
   * @title Password
   * @description Required for journalctl log streaming
   * @examples ["password"]
   */
  password?: string
  /**
   * Authentication realm
   *
   * @title Authentication realm
   * @description Authentication realm
   * @default "pam"
   */
  realm?: string
  /**
   * Token ID
   *
   * @title Token ID
   * @description API token ID, uses password authentication if not set
   * @examples ["root@pam!godoxy-token"]
   */
  token_id?: string
  /**
   * API secret
   *
   * @title API secret
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
   * @title VMID
   * @description 0 for node-level route, >0 for container route
   * @examples [0,119]
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
