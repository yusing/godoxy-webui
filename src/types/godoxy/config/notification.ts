import { URL } from "../types";

export const NOTIFICATION_PROVIDERS = ["webhook", "gotify", "ntfy"] as const;

export type NotificationProvider = (typeof NOTIFICATION_PROVIDERS)[number];

export const NOTIFICATION_FORMATS = ["markdown", "plain"];
/* Format of the notification
 *
 * @default "markdown"
 */
export type NotificationFormat = (typeof NOTIFICATION_FORMATS)[number];

export type NotificationConfig = {
  /** Provider name */
  name: string;
  /** Provider URL */
  url: URL;
  /** Message format
   *
   * @default "markdown"
   */
  format?: NotificationFormat;
};

export interface GotifyConfig extends NotificationConfig {
  /** Provider type */
  provider: "gotify";
  /** Gotify token */
  token: string;
}

export interface NtfyConfig extends NotificationConfig {
  /** Provider type */
  provider: "ntfy";
  /** Topic */
  topic: string;
  /** Ntfy token
   *
   * @default null
   */
  token?: string;
}

export const WEBHOOK_TEMPLATES = ["", "discord"] as const;
export const WEBHOOK_METHODS = ["POST", "GET", "PUT"] as const;
export const WEBHOOK_MIME_TYPES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "text/plain",
  "text/markdown",
] as const;
export const WEBHOOK_COLOR_MODES = ["hex", "dec"] as const;

export type WebhookTemplate = (typeof WEBHOOK_TEMPLATES)[number];
export type WebhookMethod = (typeof WEBHOOK_METHODS)[number];
export type WebhookMimeType = (typeof WEBHOOK_MIME_TYPES)[number];
export type WebhookColorMode = (typeof WEBHOOK_COLOR_MODES)[number];

export interface WebhookConfig extends NotificationConfig {
  provider: "webhook";
  /**
   * Template
   *
   * @default "discord"
   */
  template?: WebhookTemplate;
  /** Token */
  token?: string;
  /**
   * Message (usually JSON),
   * required when template is not defined
   *
   * @title Webhook payload
   */
  payload?: string;
  /**
   * Request method
   *
   * @default "POST"
   */
  method?: WebhookMethod;
  /**
   * MIME type
   *
   * @default "application/json"
   */
  mime_type?: WebhookMimeType;
  /**
   * Color mode
   *
   * @default "hex"
   */
  color_mode?: WebhookColorMode;
}
