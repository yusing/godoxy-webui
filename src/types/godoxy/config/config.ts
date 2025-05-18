import { DomainName } from "../types";
import { ACLConfig } from "./acl";
import { AutocertConfig } from "./autocert";
import { EntrypointConfig } from "./entrypoint";
import { HomepageConfig } from "./homepage";
import { Providers } from "./providers";

export type Config = {
  /** Optional access control configuration */
  acl?: ACLConfig;
  /** Optional autocert configuration */
  autocert?: AutocertConfig;
  /** Optional entrypoint configuration */
  entrypoint?: EntrypointConfig;
  /** Providers configuration (include file, docker, notification) */
  providers: Providers;
  /** List of domains to match
   *
   * @minItems 1
   * @default []
   */
  match_domains?: DomainName[];
  /** Homepage configuration */
  homepage?: HomepageConfig;
  /**
   * Optional timeout before shutdown
   * @default 3
   * @minimum 1
   */
  timeout_shutdown?: number;
};
