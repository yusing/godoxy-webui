import type { URL } from "../types";

/** Homepage config
 * @additionalProperties false
 */
export type HomepageConfig = {
  /** Show in dashboard
   *
   * @default true
   */
  show?: boolean;
  /** Display name */
  name?: string;
  /** Display icon */
  icon?: URL | ThirdPartyIcons | TargetRelativeIconPath;
  /** App description */
  description?: string;
  /** Override url */
  url?: URL;
  /** App category */
  category?: string;
  /** Widget config */
  widget_config?: {
    [key: string]: any;
  };
};

/** Walkxcode / selfh.st icon */
export type ThirdPartyIcons = `@${"selfhst" | "walkxcode"}/${string}.${string}`;

/** Relative path to proxy target */
export type TargetRelativeIconPath = `@target/${string}` | `/${string}`;
