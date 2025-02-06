import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { RadioCardItem, RadioCardRoot } from "@/components/ui/radio-card";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import {
  Badge,
  Card,
  Collapsible,
  createListCollection,
  Dialog,
  Flex,
  For,
  Group,
  HStack,
  IconButton,
  Input,
  Show,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadBalance, Routes } from "godoxy-schemas";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEdit } from "react-icons/fa";
import { z } from "zod";
import { IconSearcher } from "../icon_searcher";

const routeTypes = [
  {
    label: "Reverse Proxy",
    value: "rp",
    description: "proxy to http/https target",
  },
  {
    label: "Stream",
    value: "stream",
    description: "port forward a tcp/udp stream",
  },
];

const rpSchema = z.object({
  alias: z.string().min(1),
  port: z.number().min(1).max(65535).optional(),
});

const streamSchema = z.object({
  alias: z.string().min(1),
  port: z.string().regex(/^\d{1,5}:\d{1,5}$/),
});

export const RoutesEditor: React.FC<{
  data: Routes.Routes;
  onChange: (v: Routes.Routes) => void;
}> = ({ data, onChange, ...rest }) => {
  return (
    <Stack gap="4">
      <DialogRoot lazyMount motionPreset="slide-in-bottom">
        <DialogTrigger asChild>
          <Button colorPalette={"teal"}>Add Route</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Route</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <RouteEditor
              route={{}}
              onChange={(e) => {
                data[e.alias!] = e;
                delete e["alias"];
                onChange(data);
              }}
            />
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
      <For
        each={Object.entries(data)}
        fallback={<EmptyState title="No routes" />}
      >
        {([k, route]) => (
          <Card.Root key={`${k}_card`} variant={"outline"}>
            <Card.Body w="full" px="4" py="2">
              <HStack>
                <HStack wrap={"wrap"}>
                  {k}
                  <Badge colorPalette={"green"}>{route.scheme || "http"}</Badge>
                  <Badge colorPalette={"blue"}>
                    {route.host || "localhost"}
                  </Badge>
                  {route.healthcheck?.disable && <Badge>no healthcheck</Badge>}
                  {route.homepage &&
                    !route.homepage?.name &&
                    !route.homepage?.icon && <Badge>hidden</Badge>}
                </HStack>
                <Spacer />
                <DialogRoot
                  lazyMount
                  unmountOnExit
                  motionPreset="slide-in-bottom"
                >
                  <DialogTrigger asChild>
                    <IconButton variant={"ghost"}>
                      <FaEdit />
                    </IconButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Route</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      <RouteEditor
                        route={{ ...route, alias: k }}
                        onChange={(e) => {
                          delete data[k];
                          data[e.alias!] = e;
                          delete e["alias"];
                          onChange(data);
                        }}
                      />
                    </DialogBody>
                    <DialogCloseTrigger />
                  </DialogContent>
                </DialogRoot>
              </HStack>
            </Card.Body>
          </Card.Root>
        )}
      </For>
    </Stack>
  );
};

const RouteEditor: React.FC<{
  route: Routes.Route;
  onChange: (v: Routes.Route) => void;
}> = ({ route, onChange }) => {
  let t: string;
  switch (route.scheme) {
    case "http":
    case "https":
      t = "rp";
      break;
    case "fileserver":
      t = "fileserver";
      break;
    case "tcp":
    case "udp":
      t = "stream";
      break;
    default:
      t = "rp";
      break;
  }
  const [type, setType] = React.useState(t);
  return (
    <Stack gap="4">
      <RadioCardRoot
        defaultValue={type}
        onValueChange={({ value }) => setType(value)}
      >
        <Text fontWeight={"medium"}>Select route type</Text>
        <Flex gap="2">
          {routeTypes.map((t) => (
            <RadioCardItem
              key={t.value}
              label={t.label}
              value={t.value}
              description={t.description}
            />
          ))}
        </Flex>
      </RadioCardRoot>
      {type === "rp" ? (
        <ReverseProxyRouteForm
          value={route as Routes.ReverseProxyRoute}
          onSubmit={onChange}
        />
      ) : (
        <StreamRouteForm
          value={route as Routes.StreamRoute}
          onSubmit={onChange}
        />
      )}
    </Stack>
  );
};

const ReverseProxyRouteForm: React.FC<{
  value: Routes.ReverseProxyRoute;
  onSubmit: (route: Routes.ReverseProxyRoute) => void;
}> = ({ value, onSubmit }) => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<Routes.ReverseProxyRoute>({
    defaultValues: {
      scheme: "http",
      port: "80",
      homepage: {
        show: true,
      },
    },
    values: value,
    resolver: zodResolver(rpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const advConfigRef = React.useRef<HTMLDivElement>(null);
  const submit = () => onSubmit(getValues());
  const loadbalanceModes = createListCollection({
    items: LoadBalance.LOAD_BALANCE_MODES,
  });
  return (
    <Stack gap="4">
      <Field
        label="Alias"
        required
        invalid={!!errors.alias}
        errorText={errors.alias?.message}
      >
        <Input
          placeholder="Subdomain or FQDN (no trailing dot)"
          {...register("alias")}
        />
      </Field>
      <Group>
        <Field
          label="Host"
          invalid={!!errors.host}
          errorText={errors.host?.message}
        >
          <Input
            placeholder="Target host (default: localhost)"
            {...register("host")}
          />
        </Field>
        <Field
          label="Port"
          invalid={!!errors.port}
          errorText={errors.port?.message}
        >
          <Input
            placeholder="Target port (default: 80)"
            {...register("port", { valueAsNumber: true })}
          />
        </Field>
      </Group>
      <Controller
        control={control}
        name="scheme"
        render={({ field: scheme }) => (
          <HStack gap="4">
            <Checkbox
              checked={scheme.value === "https"}
              onCheckedChange={({ checked }) => {
                scheme.onChange(checked ? "https" : "http");
                setValue("no_tls_verify", false);
              }}
            >
              Is HTTPS
            </Checkbox>
            <Controller
              control={control}
              name="no_tls_verify"
              render={({ field: noTLS }) => (
                <Checkbox
                  hidden={scheme.value !== "https"}
                  checked={noTLS.value}
                  onCheckedChange={({ checked }) => noTLS.onChange(checked)}
                >
                  Skip TLS verification
                </Checkbox>
              )}
            />
          </HStack>
        )}
      />
      <Collapsible.Root lazyMount unmountOnExit>
        <Collapsible.Trigger asChild>
          <Button variant={"subtle"}>Show Advanced Options</Button>
        </Collapsible.Trigger>
        <Collapsible.Content py="4">
          <Stack gap="4" ref={advConfigRef}>
            <Field label="Load Balancer">
              <Input {...register("load_balance.link")} />
            </Field>
            <SelectRoot
              collection={loadbalanceModes}
              {...register("load_balance.mode")}
            >
              <SelectTrigger clearable>
                <SelectValueText placeholder="Load Balance Mode" />
              </SelectTrigger>
              <SelectContent portalRef={advConfigRef}>
                {loadbalanceModes.items.map((item) => (
                  <SelectItem item={item} key={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Controller
              control={control}
              name="healthcheck"
              render={({ field }) => {
                return (
                  <Checkbox
                    checked={field.value?.disable}
                    onCheckedChange={({ checked }) => {
                      if (checked) {
                        field.onChange({ disable: true });
                      } else {
                        field.onChange({ disable: false, ...field.value });
                      }
                    }}
                  >
                    Disable healthcheck
                  </Checkbox>
                );
              }}
            />
            <Controller
              control={control}
              name="homepage.show"
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? true}
                  onCheckedChange={({ checked }) => field.onChange(checked)}
                >
                  Show on dashboard
                </Checkbox>
              )}
            />
            <Controller
              control={control}
              name="homepage.show"
              render={({ field }) => (
                <Show when={field.value !== false}>
                  <Stack gap="4">
                    <Group>
                      <Field label="Display Name">
                        <Input {...register("homepage.name")} />
                      </Field>
                      <Field label="Category">
                        <Input {...register("homepage.category")} />
                      </Field>
                    </Group>
                    <Field label="Description">
                      <Input {...register("homepage.description")} />
                    </Field>
                    <IconSearcher
                      value={value.homepage?.icon ?? ""}
                      onChange={(e) => setValue("homepage.icon", e)}
                    />
                  </Stack>
                </Show>
              )}
            />
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
      <DialogFooter>
        <Dialog.CloseTrigger as="p" asChild>
          <Button disabled={!isValid} onClick={submit}>
            Save
          </Button>
        </Dialog.CloseTrigger>
      </DialogFooter>
    </Stack>
  );
};

const StreamRouteForm: React.FC<{
  value: Routes.StreamRoute;
  onSubmit: (route: Routes.StreamRoute) => void;
}> = ({ value, onSubmit }) => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<Routes.StreamRoute>({
    defaultValues: {
      scheme: "tcp",
    },
    values: value,
    resolver: zodResolver(streamSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const submit = () => onSubmit(getValues());
  return (
    <Stack gap="4">
      <Field
        label="Alias"
        required
        invalid={!!errors.alias}
        errorText={errors.alias?.message}
      >
        <Input
          placeholder="Subdomain or FQDN (no trailing dot)"
          {...register("alias")}
        />
      </Field>
      <Controller
        control={control}
        name="scheme"
        render={({ field }) => (
          <Field label="Scheme">
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={({ value }) => field.onChange(value)}
            >
              <HStack gap="6">
                {Routes.STREAM_SCHEMES.map((s) => (
                  <Radio key={s} value={s}>
                    {s}
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          </Field>
        )}
      ></Controller>
      <Field label="Host">
        <Input
          placeholder="Target host (default: localhost)"
          {...register("host")}
        />
      </Field>
      <Field
        label="Port"
        required
        invalid={!!errors.port?.message}
        errorText={errors.port?.message}
      >
        <Input placeholder="Listening:Target" {...register("port")} />
      </Field>
      <Controller
        control={control}
        name="healthcheck"
        render={({ field }) => {
          return (
            <Checkbox
              checked={field.value?.disable}
              onCheckedChange={({ checked }) => {
                if (checked) {
                  field.onChange({ disable: true });
                } else {
                  field.onChange({ disable: false, ...field.value });
                }
              }}
            >
              Disable healthcheck
            </Checkbox>
          );
        }}
      />
      <DialogFooter>
        <Dialog.ActionTrigger asChild>
          <Button disabled={!isValid} onClick={submit}>
            Save
          </Button>
        </Dialog.ActionTrigger>
      </DialogFooter>
    </Stack>
  );
};
