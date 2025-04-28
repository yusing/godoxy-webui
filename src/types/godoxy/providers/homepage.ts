import { URL } from "../types";

/**
 * @additionalProperties false
 */
export type HomepageConfig = {
  /** Whether show in dashboard
   *
   * @default true
   */
  show?: boolean;
  /* Display name on dashboard */
  name?: string;
  /* Display icon on dashboard */
  icon?: URL | ThirdPartyIcons | TargetRelativeIconPath;
  /* App description */
  description?: string;
  /* Override url */
  url?: URL;
  /* App category */
  category?: string;
  /* Widget config */
  widget_config?: {
    [key: string]: any;
  };
};

/* Walkxcode / selfh.st icon */
export type ThirdPartyIcons = `@${"selfhst" | "walkxcode"}/${string}.${string}`;

/* Relative path to proxy target */
export type TargetRelativeIconPath = `@target/${string}` | `/${string}`;
