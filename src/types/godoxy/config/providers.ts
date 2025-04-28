import { ProxmoxConfig } from "../providers/proxmox";
import { URI, URL } from "../types";
import { GotifyConfig, NtfyConfig, WebhookConfig } from "./notification";

export type Providers = {
  /** List of route definition files to include
   *
   * @minItems 1
   * @items.pattern ^[\w\d\-_]+\.(yaml|yml)$
   */
  include?: URI[];
  /** Name-value mapping of docker hosts to retrieve routes from
   *
   * @minProperties 1
   */
  docker?: { [name: string]: URL | "$DOCKER_HOST" };
  /** List of GoDoxy agents
   *
   * @minItems 1
   */
  agents?: `${string}:${number}`[];
  /** List of proxmox providers
   *
   * @minItems 1
   */
  proxmox?: ProxmoxConfig[];
  /** List of notification providers
   *
   * @minItems 1
   */
  notification?: (WebhookConfig | GotifyConfig | NtfyConfig)[];
};
