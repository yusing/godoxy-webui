import { ListInput } from "@/components/input";
import { Field } from "@/components/ui/field";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import {
  createListCollection,
  Fieldset,
  For,
  Input,
  Stack,
} from "@chakra-ui/react";
import { Autocert } from "godoxy-schemas";
import React from "react";
import { Controller } from "react-hook-form";
import useHookForm from "./hook-form";

export const AutocertUIEditor: React.FC<{
  cfg: Autocert.AutocertConfig;
  onChange: (v: Autocert.AutocertConfig) => void;
}> = ({ cfg, onChange }) => {
  const collection = React.useMemo(
    () =>
      createListCollection({
        items: Autocert.AUTOCERT_PROVIDERS,
        itemToString: (item) => item,
        itemToValue: (item) => item,
      }),
    [],
  );
  const { register } = useHookForm({ value: cfg, onChange: onChange });
  const [value, setValue] = React.useState(cfg.provider);

  return (
    <Stack gap="3">
      <SelectRoot
        collection={collection}
        value={[value]}
        onValueChange={({ value }) => {
          cfg.provider = value[0]! as Autocert.AutocertProvider;
          setValue(value[0]! as Autocert.AutocertProvider);
          if (cfg.provider === "local") {
            cfg = { provider: "local" } as Autocert.LocalOptions;
          } else {
            // @ts-ignore
            delete cfg.options;
          }
          onChange(cfg);
        }}
      >
        <SelectLabel>Certificate provider</SelectLabel>
        <SelectTrigger>
          <SelectValueText />
        </SelectTrigger>
        <SelectContent>
          {Autocert.AUTOCERT_PROVIDERS.map((provider) => (
            <SelectItem key={provider} item={provider}>
              {provider}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {cfg.provider !== "local" && (
        <>
          <Field required label="Email">
            <Input {...register("email")} />
          </Field>
          <ListInput
            label="Domains"
            placeholder="domain"
            value={cfg.domains ?? []}
            onChange={(v) => {
              // @ts-ignore
              cfg.domains = v;
              onChange(cfg);
            }}
          />
        </>
      )}
      {cfg.provider !== "local" ? (
        <Fieldset.Root>
          <Fieldset.Legend>Provider Options</Fieldset.Legend>
          <Fieldset.Content>
            {cfg.provider === "ovh" ? (
              <OVHConfigEditor
                cfg={cfg as Autocert.OVHOptionsWithAppKey}
                onChange={onChange}
              />
            ) : (
              <ProviderConfigEditor cfg={cfg} onChange={onChange} />
            )}
          </Fieldset.Content>
        </Fieldset.Root>
      ) : null}
    </Stack>
  );
};

const providerOptions = {
  local: [],
  cloudflare: [
    {
      label: "Auth Token",
      value: "auth_token",
    },
  ],
  clouddns: [
    {
      label: "Client ID",
      value: "client_id",
    },
    {
      label: "Email",
      value: "email",
    },
    {
      label: "Password",
      value: "password",
    },
  ],
  duckdns: [
    {
      label: "Token",
      value: "token",
    },
  ],
  ovh: [
    {
      label: "Application key",
      value: "application_key",
    },
    {
      label: "Application secret",
      value: "application_secret",
    },
    {
      label: "Consumer key",
      value: "consumer_key",
    },
  ],
} as const;

const ProviderConfigEditor: React.FC<{
  cfg:
    | Autocert.CloudflareOptions
    | Autocert.CloudDNSOptions
    | Autocert.DuckDNSOptions;
  onChange: (v: Autocert.AutocertConfig) => void;
}> = ({ cfg, onChange }) => {
  const { register, errors } = useHookForm({
    value: cfg.options,
    onChange: (e) => {
      cfg.options = e;
      onChange(cfg);
    },
  });
  return (
    //@ts-ignore
    <For each={providerOptions[cfg.provider]}>
      {({ label, value }) => (
        <Field
          key={value}
          label={label}
          required
          //@ts-ignore
          invalid={!!errors[value]}
          //@ts-ignore
          errorText={errors[value]?.message}
        >
          <Input
            type={value}
            //@ts-ignore
            {...register(value)}
          />
        </Field>
      )}
    </For>
  );
};

const OVHConfigEditor: React.FC<{
  cfg: Autocert.OVHOptionsWithAppKey;
  onChange: (v: Autocert.OVHOptionsWithAppKey) => void;
}> = ({ cfg, onChange }) => {
  const { control, register, errors } = useHookForm({
    value: cfg.options,
    onChange: (e) => {
      cfg.options = e;
      onChange(cfg);
    },
  });
  const apiEndpoints = React.useMemo(
    () =>
      createListCollection({
        items: Autocert.OVH_ENDPOINTS,
        itemToString: (item) => item,
        itemToValue: (item) => item,
      }),
    [],
  );
  return (
    <>
      <For each={providerOptions["ovh"]}>
        {({ label, value }) => (
          <Field
            key={value}
            label={label}
            required
            invalid={!!errors[value]}
            errorText={errors[value]?.message}
          >
            <Input type={value} {...register(value)} />
          </Field>
        )}
      </For>
      <Field key={"api_endpoint"} label={"API endpoint"}>
        <Controller
          control={control}
          name={"api_endpoint"}
          render={({ field }) => (
            <SelectRoot
              value={[field.value ?? ""]}
              onValueChange={({ value }) => {
                field.onChange(value);
                onChange({
                  ...cfg,
                  options: {
                    ...cfg.options,
                    api_endpoint: value[0]! as Autocert.OVHEndpoint,
                  },
                });
              }}
              onInteractOutside={field.onBlur}
              collection={apiEndpoints}
            >
              <SelectTrigger clearable>
                <SelectValueText />
              </SelectTrigger>
              <SelectContent>
                {apiEndpoints.items.map((item) => (
                  <SelectItem key={item} item={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          )}
        />
      </Field>
    </>
  );
};
