import type { Hostname, Port, URL } from '../types'

export { type DockerConfig, type DockerProviderMap }

type DockerProviderMap = Record<string, DockerConfig | URL | '$DOCKER_HOST'>

type DockerConfig = {
  /** The scheme to use for the connection. */
  scheme: 'http' | 'https' | 'tcp'
  /** The host to connect to. */
  host: Hostname
  /** The port to connect to. */
  port: Port
  /** The TLS configuration. */
  tls?: {
    /** The path to the CA certificate. */
    ca_file: string
    /** The path to the client certificate. */
    cert_file?: string
    /** The path to the client certificate key. */
    key_file?: string
  }
}
