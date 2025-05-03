import { ListInput } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { CertInfo, fetchCertInfo, renewCert } from "@/lib/api/cert";
import { formatTimestamp } from "@/lib/format";
import { toastError } from "@/types/api/endpoints";
import { Autocert } from "@/types/godoxy";
import {
  createListCollection,
  DataList,
  DialogContext,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Fieldset,
  For,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { LuRefreshCcw } from "react-icons/lu";
import { useList } from "react-use";
import { LogLine } from "../logline";
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
  const { control, register } = useHookForm({ value: cfg, onChange: onChange });
  return (
    <Controller
      control={control}
      name="provider"
      render={({ field }) => (
        <Stack gap="3">
          <SelectRoot
            collection={collection}
            value={[field.value]}
            onValueChange={({ value }) => {
              cfg.provider = value[0]! as Autocert.AutocertProvider;
              if (cfg.provider === "local") {
                cfg = { provider: "local" } as Autocert.LocalOptions;
              } else {
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
          {field.value !== "local" && (
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
          {field.value !== "local" && (
            <Fieldset.Root>
              <Fieldset.Legend>Provider Options</Fieldset.Legend>
              <Fieldset.Content>
                {field.value === "ovh" ? (
                  <OVHConfigEditor
                    cfg={cfg as Autocert.OVHOptionsWithAppKey}
                    onChange={onChange}
                  />
                ) : (
                  <ProviderConfigEditor cfg={cfg} onChange={onChange} />
                )}
              </Fieldset.Content>
            </Fieldset.Root>
          )}
          <Stack gap="2">
            <Heading size="sm">
              Current certificate
              <RenewLogDialogButton />
            </Heading>
            <CertInfoWidget />
          </Stack>
        </Stack>
      )}
    />
  );
};

const RenewLogDialogButton: React.FC = () => {
  return (
    <DialogRoot
      lazyMount
      unmountOnExit
      size="cover"
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <DialogTrigger asChild>
        <DialogContext>
          {(store) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                store.setOpen(true);
              }}
              loading={store.open}
              loadingText="Renewing..."
            >
              <LuRefreshCcw />
              Renew
            </Button>
          )}
        </DialogContext>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew Log</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <RenewLogDialogBody />
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

const RenewLogDialogBody: React.FC<{
  onFinish?: () => void;
}> = ({ onFinish }) => {
  const [log, { push }] = useList<string>();
  useEffect(() => {
    const ws = renewCert();
    if (!ws) return;
    ws.onmessage = (e) => {
      push(e.data);
    };
    ws.onclose = () => {
      onFinish?.();
    };
    return () => {
      ws.close();
    };
  }, []);
  return (
    <Stack gap="2" overflowY="auto" maxH="50vh">
      <For each={log}>{(item, i) => <LogLine key={i} line={item} />}</For>
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

const CertInfoWidget: React.FC = () => {
  const [certInfo, setCertInfo] = React.useState<CertInfo | null>(null);
  useEffect(() => {
    fetchCertInfo().then(setCertInfo).catch(toastError);
  }, []);
  if (!certInfo) return null;
  return (
    <DataList.Root orientation="horizontal">
      <DataList.Item>
        <DataList.ItemLabel>Subject</DataList.ItemLabel>
        <DataList.ItemValue>{certInfo.subject}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Issuer</DataList.ItemLabel>
        <DataList.ItemValue>{certInfo.issuer}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Registration</DataList.ItemLabel>
        <DataList.ItemValue>
          {formatTimestamp(certInfo.not_before)}
        </DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Expiry</DataList.ItemLabel>
        <DataList.ItemValue>
          {formatTimestamp(certInfo.not_after)}
        </DataList.ItemValue>
      </DataList.Item>
      {certInfo.dns_names &&
        certInfo.dns_names.map((name, i) => (
          <DataList.Item key={name}>
            <DataList.ItemLabel>DNS name {i + 1}</DataList.ItemLabel>
            <DataList.ItemValue>{name}</DataList.ItemValue>
          </DataList.Item>
        ))}
      {certInfo.email_addresses && (
        <DataList.Item>
          <DataList.ItemLabel>Email addresses</DataList.ItemLabel>
          <DataList.ItemValue>
            {certInfo.email_addresses.join(", ")}
          </DataList.ItemValue>
        </DataList.Item>
      )}
    </DataList.Root>
  );
};
