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
  ACLSchema,
  Autocert,
  Config,
  ConfigSchema,
  MaxmindSchema,
} from "@/types/godoxy";
import { RequestLogConfig } from "@/types/godoxy/config/access_log";
import { ACLMatcher } from "@/types/godoxy/config/acl";
import { MaxmindConfig } from "@/types/godoxy/config/maxmind";
import { JSONSchema } from "@/types/schema";
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
              value={data.acl?.allow ?? ([] as ACLMatcher[])}
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
              schema={ACLSchema.definitions.ACLLogConfig}
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
              schema={
                ConfigSchema.definitions
                  .RequestLogConfig as unknown as JSONSchema
              }
              value={data.entrypoint?.access_log ?? ({} as RequestLogConfig)}
              onChange={(v) => {
                if (!data.entrypoint) data.entrypoint = {};
                data.entrypoint.access_log = v;
                onChange(data);
              }}
            />
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
            keyField="url"
            nameField="url"
            schema={ConfigSchema.definitions.ProxmoxConfig}
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
            schema={MaxmindSchema.definitions.MaxmindConfig as JSONSchema}
            value={data.providers?.maxmind ?? ({} as MaxmindConfig)}
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
            keyField="provider"
            nameField="name"
            schema={
              ConfigSchema.definitions.Providers.properties.notification
                .items as unknown as JSONSchema
            }
            value={data.providers?.notification ?? []}
            onChange={(v) => {
              const newData = structuredClone(data);
              if (!newData.providers) newData.providers = {};
              //@ts-ignore
              newData.providers.notification = v;
              if (Object.keys(v).length === 0) {
                delete newData.providers.notification;
              }
              onChange(newData);
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
