export type InboundMTLSProfile = {
  /** Additional PEM CA files used as trust sources
   *
   * @minItems 1
   * @title Additional PEM CA files
   */
  ca_files?: string[]
  /** Use the system CA store as a trust source
   * @title Use system CA store
   */
  use_system_cas?: boolean
}

/** Named inbound mTLS trust profiles */
export type InboundMTLSProfiles = Record<string, InboundMTLSProfile>
