import type { FileServerRoute } from "../providers/routes";

export type WebUIConfig = {
  /** WebUI aliases
   *
   * @default ["godoxy"]
   */
  aliases?: string[];
} & Pick<
  FileServerRoute,
  "inbound_mtls_profile" | "middlewares" | "access_log"
>;
