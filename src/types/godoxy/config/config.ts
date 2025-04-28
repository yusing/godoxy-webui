import { DomainName } from "../types";
import { AutocertConfig } from "./autocert";
import { EntrypointConfig } from "./entrypoint";
import { HomepageConfig } from "./homepage";
import { Providers } from "./providers";

export type Config = {
  /** Optional autocert configuration */
  autocert?: AutocertConfig;
  /** Optional entrypoint configuration */
  entrypoint?: EntrypointConfig;
  /** Providers configuration (include file, docker, notification) */
  providers: Providers;
  /** Optional list of domains to match
   *
   * @minItems 1
   */
  match_domains?: DomainName[];
  /* Optional homepage configuration */
  homepage?: HomepageConfig;
  /**
   * Optional timeout before shutdown
   * @default 3
   * @minimum 1
   */
  timeout_shutdown?: number;
};
