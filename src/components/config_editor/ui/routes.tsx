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
import { Homepage, LoadBalance, Routes } from "@/types/godoxy";
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
import { Pencil, Trash } from "lucide-react";
import React from "react";
import { Control, Controller, useForm, UseFormRegister } from "react-hook-form";
import { IconSearcher } from "../icon_searcher";
const routeTypes = [
  {
    label: "Reverse Proxy",
    value: "rp",
    description: "proxy to a http/https app",
  },
  {
    label: "File Server",
    value: "fileserver",
    description: "serve files over http/https",
  },
  {
    label: "Stream",
    value: "stream",
    description: "port forward a tcp/udp app",
  },
] as const;

export const RoutesEditor: React.FC<{
  data: Routes.Routes;
  onChange: (v: Routes.Routes) => void;
}> = ({ data, onChange }) => {
  return (
    <Stack gap="4">
      <DialogRoot lazyMount unmountOnExit motionPreset="slide-in-bottom">
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
                {route.scheme === "fileserver" ? (
                  <HStack wrap={"wrap"}>
                    {k}
                    <Badge colorPalette={"green"}>{route.scheme}</Badge>
                    <Badge colorPalette={"blue"}>{route.root}</Badge>
                  </HStack>
                ) : (
                  <HStack wrap={"wrap"}>
                    {k}
                    <Badge colorPalette={"green"}>
                      {route.scheme || "http"}
                    </Badge>
                    <Badge colorPalette={"blue"}>
                      {route.host || "localhost"}
                    </Badge>
                    {route.healthcheck?.disable && (
                      <Badge>no healthcheck</Badge>
                    )}
                    {(route.scheme === "http" || route.scheme === "https") &&
                      !route.homepage?.name &&
                      !route.homepage?.icon && <Badge>hidden</Badge>}
                  </HStack>
                )}
                <Spacer />
                <DialogRoot
                  lazyMount
                  unmountOnExit
                  motionPreset="slide-in-bottom"
                >
                  <DialogTrigger asChild>
                    <IconButton variant={"ghost"}>
                      <Pencil />
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
                <IconButton
                  variant={"ghost"}
                  colorPalette={"red"}
                  onClick={() => {
                    delete data[k];
                    onChange(data);
                  }}
                >
                  <Trash />
                </IconButton>
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
  switch (route.scheme ?? "http") {
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
        onValueChange={({ value }) => setType(value ?? "http")}
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
      ) : type === "fileserver" ? (
        <FileServerRouteForm
          value={route as Routes.FileServerRoute}
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
            <HealthcheckSettings control={control} />
            <HomepageSettings control={control} register={register} />
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
      <FormFooter isValid={isValid} onSubmit={submit} />
    </Stack>
  );
};

const FileServerRouteForm: React.FC<{
  value: Routes.FileServerRoute;
  onSubmit: (route: Routes.FileServerRoute) => void;
}> = ({ value, onSubmit }) => {
  const {
    control,
    register,
    getValues,
    formState: { errors, isValid },
  } = useForm<Routes.FileServerRoute>({
    defaultValues: {
      scheme: "fileserver",
    },
    values: value,
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
      <Field
        label="Path"
        required
        invalid={!!errors.root}
        errorText={errors.root?.message}
      >
        <Input
          placeholder="Absolute path to file or directory (remember to mount to GoDoxy)"
          {...register("root")}
        />
      </Field>
      <Collapsible.Root lazyMount unmountOnExit>
        <Collapsible.Trigger asChild>
          <Button variant={"subtle"}>Show Advanced Options</Button>
        </Collapsible.Trigger>
        <Collapsible.Content py="4">
          <HomepageSettings control={control} register={register} />
          <HealthcheckSettings control={control} />
        </Collapsible.Content>
      </Collapsible.Root>
      <FormFooter isValid={isValid} onSubmit={submit} />
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
    getValues,
    formState: { errors, isValid },
  } = useForm<Routes.StreamRoute>({
    defaultValues: {
      scheme: "tcp",
    },
    values: value,
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
      <HealthcheckSettings control={control} />
      <FormFooter isValid={isValid} onSubmit={submit} />
    </Stack>
  );
};

type WithHomepage = { homepage?: Homepage.HomepageConfig };
function HomepageSettings({
  control,
  register,
}: {
  control: Control<WithHomepage>;
  register: UseFormRegister<WithHomepage>;
}) {
  return (
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
            <Controller
              control={control}
              name="homepage.icon"
              render={({ field: iconField }) => (
                <IconSearcher
                  value={iconField.value ?? ""}
                  onChange={iconField.onChange}
                />
              )}
            />
          </Stack>
        </Show>
      )}
    />
  );
}

type WithHealthcheck = { healthcheck?: { disable?: boolean } };
function HealthcheckSettings({
  control,
}: {
  control: Control<WithHealthcheck>;
}) {
  return (
    <Controller
      control={control}
      name="healthcheck.disable"
      render={({ field }) => (
        <Checkbox
          checked={!!field.value}
          onCheckedChange={({ checked }) => field.onChange(checked)}
        >
          Disable healthcheck
        </Checkbox>
      )}
    />
  );
}

function FormFooter({
  isValid,
  onSubmit,
}: Readonly<{ isValid: boolean; onSubmit: () => void }>) {
  return (
    <DialogFooter>
      <Dialog.CloseTrigger asChild>
        <Button position={"relative"} disabled={!isValid} onClick={onSubmit}>
          Save
        </Button>
      </Dialog.CloseTrigger>
    </DialogFooter>
  );
}
