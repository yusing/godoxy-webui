import type { Hostname, Port, URL } from '../types'

export type { DockerConfig, DockerProviderMap }

/** Name-value mapping of docker hosts to retrieve routes from
 *
 * @additionalProperties true
 */
type DockerProviderMap = Record<string, DockerConfig | URL | '$DOCKER_HOST'>

type DockerConfig = {
  /** Scheme to use */
  scheme: 'http' | 'https' | 'tcp' | 'tls' | 'unix' | 'ssh'
  /** Host to connect to   */
  host: Hostname
  /** Port to connect to */
  port: Port
  /** TLS configuration */
  tls?: {
    /** Path to the CA certificate */
    ca_file: string
    /** Path to the client certificate */
    cert_file?: string
    /** Path to the client certificate key */
    key_file?: string
  }
}
