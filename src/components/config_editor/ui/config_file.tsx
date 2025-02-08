import { ListInput, MapInput, NamedListInput } from "@/components/input";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { getSchemaDescription } from "@/types/schema";
import { Stack } from "@chakra-ui/react";
import { Autocert, Config, ConfigSchema, Notification } from "godoxy-schemas";
import React from "react";
import { FaHome } from "react-icons/fa";
import { FaDocker, FaInbox, FaLink } from "react-icons/fa6";
import { PiCertificate } from "react-icons/pi";
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
    >
      <AccordionItem value="autocert">
        <AccordionItemTrigger>
          <PiCertificate />
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
      <AccordionItem value="entrypoint">
        <AccordionItemTrigger>
          <FaInbox />
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
                ConfigSchema.properties.entrypoint.properties.access_log
                  .properties,
              )}
              description={getSchemaDescription(
                ConfigSchema.properties.entrypoint.properties.access_log
                  .properties,
              )}
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
      <AccordionItem value="providers">
        <AccordionItemTrigger>
          <FaDocker />
          Providers
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
                ntfy: Object.keys(
                  ConfigSchema.definitions.NtfyConfig.properties,
                ),
              }}
              allowedValues={{
                webhook: {
                  template: Notification.WEBHOOK_TEMPLATES,
                  method: Notification.WEBHOOK_METHODS,
                  mime_type: Notification.WEBHOOK_MIME_TYPES,
                  color_mode: Notification.WEBHOOK_COLOR_MODES,
                },
                ntfy: {
                  style: Notification.NTFY_MSG_STYLES,
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
          </Stack>
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
