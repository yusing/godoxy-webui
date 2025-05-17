import { ListInput, MapInput, NamedListInput } from "@/components/input";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  AccessLog,
  Autocert,
  Config,
  ConfigSchema,
  MaxmindSchema,
  Notification,
} from "@/types/godoxy";
import { getSchemaDescription } from "@/types/schema";
import { Stack } from "@chakra-ui/react";
import React from "react";
import { FaHome } from "react-icons/fa";
import {
  FaBell,
  FaCertificate,
  FaCloud,
  FaDocker,
  FaLink,
  FaLock,
  FaMapLocationDot,
  FaServer,
} from "react-icons/fa6";
import { AutocertUIEditor } from "./autocert";
import { MiddlewareEditor } from "./middlewares";

export function ConfigUIEditor({
  data,
  onChange,
}: Readonly<{
  data: Config.Config;
  onChange: (v: Config.Config) => void;
}>) {
  const [value, setValue] = React.useState<string[]>([]);

  if (!data) {
    data = {} as Config.Config;
  }

  return (
    <AccordionRoot
      collapsible
      size="lg"
      variant={"plain"}
      value={value}
      onValueChange={({ value }) => setValue(value)}
      lazyMount
      unmountOnExit
    >
      <AccordionItem value="autocert">
        <AccordionItemTrigger>
          <FaCertificate />
          Autocert
        </AccordionItemTrigger>
        <AccordionItemContent>
          <AutocertUIEditor
            cfg={
              data.autocert ?? ({ provider: "local" } as Autocert.LocalOptions)
            }
            onChange={(v) => {
              data.autocert = v;
              onChange(data);
            }}
          />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="acl">
        <AccordionItemTrigger>
          <FaLock />
          Access Control
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Stack gap="3">
            <Field
              label={`Default ${data.acl?.default === "allow" ? "allow" : "deny"}`}
            >
              <Switch
                gap="2"
                checked={!(data.acl?.default === "deny")}
                onCheckedChange={({ checked }) => {
                  if (!data.acl) data.acl = {};
                  data.acl.default = checked ? "allow" : "deny";
                  onChange(data);
                }}
              />
            </Field>
            <ListInput
              label="Allowed"
              value={data.acl?.allow ?? []}
              onChange={(v) => {
                if (!data.acl) data.acl = {};
                data.acl.allow = v;
                onChange(data);
              }}
            />
            <ListInput
              label="Denied"
              value={data.acl?.deny ?? []}
              onChange={(v) => {
                if (!data.acl) data.acl = {};
                data.acl.deny = v;
                onChange(data);
              }}
            />
            <MapInput
              label="Log"
              allowedKeys={Object.keys(
                ConfigSchema.definitions.ACLLogConfig.properties,
              )}
              value={data.acl?.log ?? {}}
              onChange={(v) => {
                if (!data.acl) data.acl = {};
                data.acl.log = v;
                onChange(data);
              }}
            />
          </Stack>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="entrypoint">
        <AccordionItemTrigger>
          <FaCloud />
          Entrypoint
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Stack gap="3">
            <MiddlewareEditor
              label="Middlewares"
              data={data.entrypoint?.middlewares ?? []}
              onChange={(e) => {
                if (!data.entrypoint) data.entrypoint = {};
                data.entrypoint.middlewares = e;
                onChange(data);
              }}
            />
            <MapInput
              label="Access Log"
              allowedKeys={Object.keys(
                ConfigSchema.definitions.RequestLogConfig.properties,
              )}
              description={getSchemaDescription(
                ConfigSchema.definitions.RequestLogConfig.properties,
              )}
              allowedValues={{
                format: AccessLog.REQUEST_LOG_FORMATS,
              }}
              value={data.entrypoint?.access_log ?? {}}
              onChange={(v) => {
                if (!data.entrypoint) data.entrypoint = {};
                data.entrypoint.access_log = v;
                onChange(data);
              }}
            ></MapInput>
          </Stack>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="route_providers">
        <AccordionItemTrigger>
          <FaDocker />
          Route Providers
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Stack gap="3">
            <ListInput
              label="Include files"
              placeholder="file.yml"
              value={data.providers?.include ?? []}
              onChange={(v) => {
                if (!data.providers) data.providers = {};
                data.providers.include = v;
                onChange(data);
              }}
            />
            <ListInput
              label="Agents"
              placeholder="address:port"
              value={data.providers?.agents ?? []}
              onChange={(v) => {
                if (!data.providers) data.providers = {};
                data.providers.agents = v as typeof data.providers.agents;
                onChange(data);
              }}
            />
            <MapInput
              label="Docker"
              placeholder={{
                key: "Name",
                value: "proto://host:port",
              }}
              value={data.providers?.docker ?? {}}
              onChange={(v) => {
                if (!data.providers) data.providers = {};
                data.providers.docker = v;
                if (Object.keys(v).length === 0) delete data.providers.docker;
                onChange(data);
              }}
            />
          </Stack>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="proxmox">
        <AccordionItemTrigger>
          <FaServer />
          Proxmox
        </AccordionItemTrigger>
        <AccordionItemContent>
          <NamedListInput
            label="Proxmox"
            nameField="url"
            value={data.providers?.proxmox ?? []}
            onChange={(v) => {
              if (!data.providers) data.providers = {};
              data.providers.proxmox = v;
              onChange(data);
            }}
          />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="maxmind">
        <AccordionItemTrigger>
          <FaMapLocationDot />
          Maxmind
        </AccordionItemTrigger>
        <AccordionItemContent>
          <MapInput
            label="Maxmind"
            allowedKeys={Object.keys(
              MaxmindSchema.definitions.MaxmindConfig.properties,
            )}
            value={data.providers?.maxmind ?? {}}
            onChange={(v) => {
              if (!data.providers) data.providers = {};
              data.providers.maxmind = v;
              onChange(data);
            }}
          />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="notifications">
        <AccordionItemTrigger>
          <FaBell />
          Notifications
        </AccordionItemTrigger>
        <AccordionItemContent>
          <NamedListInput
            label="Notification"
            nameField="provider"
            allowedNames={Notification.NOTIFICATION_PROVIDERS}
            allowedKeys={{
              webhook: Object.keys(
                ConfigSchema.definitions.WebhookConfig.properties,
              ),
              gotify: Object.keys(
                ConfigSchema.definitions.GotifyConfig.properties,
              ),
              ntfy: Object.keys(ConfigSchema.definitions.NtfyConfig.properties),
            }}
            allowedValues={{
              webhook: {
                template: Notification.WEBHOOK_TEMPLATES,
                method: Notification.WEBHOOK_METHODS,
                mime_type: Notification.WEBHOOK_MIME_TYPES,
                color_mode: Notification.WEBHOOK_COLOR_MODES,
              },
              gotify: {
                format: Notification.NOTIFICATION_FORMATS,
              },
              ntfy: {
                format: Notification.NOTIFICATION_FORMATS,
              },
            }}
            description={{
              webhook: getSchemaDescription(
                ConfigSchema.definitions.WebhookConfig.properties,
              ),
              gotify: getSchemaDescription(
                ConfigSchema.definitions.GotifyConfig.properties,
              ),
              ntfy: getSchemaDescription(
                ConfigSchema.definitions.NtfyConfig.properties,
              ),
            }}
            //@ts-ignore
            value={data.providers?.notification ?? []}
            onChange={(v) => {
              if (!data.providers) data.providers = {};
              //@ts-ignore
              data.providers.notification = v;
              if (Object.keys(v).length === 0)
                delete data.providers.notification;
              onChange(data);
            }}
          />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="match-domains">
        <AccordionItemTrigger>
          <FaLink />
          Match Domains
        </AccordionItemTrigger>
        <AccordionItemContent>
          <ListInput
            label="Match Domains"
            placeholder="domain"
            value={data.match_domains ?? []}
            onChange={(v) => {
              data.match_domains = v;
              if (v.length === 0) {
                delete data.match_domains;
              }
              onChange(data);
            }}
          />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="homepage">
        <AccordionItemTrigger>
          <FaHome />
          Homepage
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Field label="Use default categories">
            <Switch
              checked={data.homepage?.use_default_categories ?? false}
              onCheckedChange={({ checked }) => {
                if (!data.homepage) {
                  data.homepage = { use_default_categories: checked };
                } else {
                  data.homepage.use_default_categories = checked;
                }
                onChange(data);
              }}
            />
          </Field>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  );
}
