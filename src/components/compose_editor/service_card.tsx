import {
  DockerComposeServiceGoDoxy,
  preprocessService,
  serviceGoDoxySchemaResolver,
  toDockerComposeService,
  type DockerComposeService,
} from "@/lib/docekr-compose/service";
import {
  Box,
  Button,
  Card,
  Code,
  createListCollection,
  Field,
  Fieldset,
  HStack,
  Icon,
  IconButton,
  Input,
  ListCollection,
  Select,
  Stack,
  type ButtonProps,
} from "@chakra-ui/react";
import { Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { type IconType } from "react-icons/lib";
import { MapInput } from "../input";
import { Radio, RadioGroup } from "../ui/radio";
import RestartPolicyField from "./restart-policy";

export default function ServiceCard({
  services,
  serviceName,
  service,
  setService,
  onDelete,
}: {
  services: Record<string, DockerComposeService>;
  serviceName: string;
  service: DockerComposeService;
  setService: (service: DockerComposeService) => void;
  setServicePreview: (service: DockerComposeService) => void;
  onDelete: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [serviceProcessed, setServiceProcessed] = useState(
    preprocessService(service),
  );
  const otherServices = useMemo(
    () =>
      createListCollection({
        items: Object.keys(services).filter((name) => name !== serviceName),
      }),
    [services, serviceName],
  );

  return (
    <Card.Root variant={"subtle"} size="sm">
      <Card.Body>
        <Card.Title>{serviceName}</Card.Title>
        {serviceProcessed.image && (
          <Card.Description
            textOverflow={"ellipsis"}
            textWrap={"nowrap"}
            maxW="100px"
          >
            {serviceProcessed.image.name}
            {<Code>{serviceProcessed.image.tag ?? "latest"}</Code>}
          </Card.Description>
        )}
        <HStack pt={2}>
          <ServiceCardButton
            onClick={() => {
              setEditMode(!editMode);
            }}
            text={editMode ? "Save" : "Edit"}
            icon={editMode ? FaSave : FaEdit}
          />
          <ServiceCardButton
            bg="red.500"
            onClick={() => {
              setEditMode(false);
              onDelete();
            }}
            text="Delete"
            icon={FaTrash}
          />
        </HStack>
        {
          <Box
            hidden={!editMode}
            data-state={editMode ? "open" : "closed"}
            animationDuration={"slow"}
            _open={{
              animationName: "fade-in",
            }}
            _closed={{
              animationName: "fade-out",
            }}
            pt={4}
          >
            <ServiceCardEditFields
              otherServices={otherServices}
              service={serviceProcessed}
              setService={(service) => {
                setServiceProcessed(service);
                setService(toDockerComposeService(service));
              }}
            />
          </Box>
        }
      </Card.Body>
    </Card.Root>
  );
}

function ServiceCardEditFields({
  otherServices,
  service,
  setService,
}: {
  otherServices: ListCollection<string>;
  service: DockerComposeServiceGoDoxy;
  setService: (service: DockerComposeServiceGoDoxy) => void;
}) {
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    values: service,
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: serviceGoDoxySchemaResolver,
  });

  useEffect(() => {
    const sub = watch(() => handleSubmit(console.log)());
    return sub.unsubscribe;
  }, [handleSubmit, watch]);

  return (
    <form onSubmit={handleSubmit(setService)}>
      <Stack gap={4}>
        <Fieldset.Root>
          <Fieldset.Legend>Image</Fieldset.Legend>
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input {...register("image.name")} size="sm" />
              <Field.RequiredIndicator />
            </Field.Root>
            <HStack>
              <Field.Root>
                <Field.Label>Tag</Field.Label>
                <Input {...register("image.tag")} size="sm" />
              </Field.Root>
              <Field.Root>
                <Field.Label>Digest</Field.Label>
                <Input {...register("image.digest")} size="sm" />
              </Field.Root>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
        <RestartPolicyField {...register("restart")} />
        <Fieldset.Root>
          <Fieldset.Legend>Ports</Fieldset.Legend>
          <Fieldset.Content>
            {service.ports?.map((port, index) => (
              <HStack key={index} gap={2}>
                <Field.Root>
                  <Field.Label>IP</Field.Label>
                  <Input {...register(`ports.${index}.ip`)} size="sm" />
                  <Field.ErrorText>
                    {errors.ports?.[index]?.ip?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Host</Field.Label>
                  <Input
                    {...register(`ports.${index}.host`, {
                      valueAsNumber: true,
                    })}
                    size="sm"
                  />
                  <Field.ErrorText>
                    {errors.ports?.[index]?.host?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Container</Field.Label>
                  <Input
                    {...register(`ports.${index}.container`, {
                      valueAsNumber: true,
                    })}
                    size="sm"
                  />
                  <Field.ErrorText>
                    {errors.ports?.[index]?.container?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Protocol</Field.Label>
                  <Controller
                    control={control}
                    name={`ports.${index}.protocol`}
                    render={({ field }) => (
                      <RadioGroup
                        name={field.name}
                        value={field.value ?? "tcp"}
                        onValueChange={({ value }) => field.onChange(value)}
                      >
                        <HStack gap={4}>
                          <Radio value="tcp">TCP</Radio>
                          <Radio value="udp">UDP</Radio>
                        </HStack>
                      </RadioGroup>
                    )}
                  />
                </Field.Root>
                <Controller
                  control={control}
                  name={`ports`}
                  render={({ field }) => (
                    <IconButton
                      variant="ghost"
                      color="red.500"
                      onClick={() => {
                        field.onChange(
                          field.value?.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <Trash />
                    </IconButton>
                  )}
                />
              </HStack>
            ))}
            <Controller
              control={control}
              name="ports"
              render={({ field }) => (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    field.onChange([...(field.value ?? []), { host: 0 }]);
                  }}
                >
                  <Icon as={FaPlus} /> {"Add Port"}
                </Button>
              )}
            />
          </Fieldset.Content>
        </Fieldset.Root>
        <Controller
          control={control}
          name="environment"
          render={({ field }) => (
            <MapInput
              label="Environment Variables"
              value={field.value ?? {}}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="labels"
          render={({ field }) => (
            <MapInput
              label="Labels"
              value={field.value ?? {}}
              onChange={field.onChange}
            />
          )}
        />
        {otherServices.items.length > 0 && (
          <Fieldset.Root>
            <Fieldset.Legend>Depends On</Fieldset.Legend>
            <Fieldset.Content>
              <Select.Root
                collection={otherServices}
                {...register("depends_on")}
              >
                <Select.Trigger />
                <Select.Content>
                  {otherServices.items.map((item) => (
                    <Select.Item key={item} item={item} />
                  ))}
                </Select.Content>
              </Select.Root>
            </Fieldset.Content>
          </Fieldset.Root>
        )}
      </Stack>
    </form>
  );
}

function ServiceCardButton({
  onClick,
  icon,
  text,
  bg,
}: {
  text: string;
  onClick: () => void;
  icon: IconType;
  bg?: ButtonProps["bg"];
}) {
  return (
    <Button
      size={"sm"}
      variant={"subtle"}
      borderRadius={"xl"}
      onClick={onClick}
      bg={bg ?? "gray.800"}
      color="white"
    >
      <Icon as={icon} />
      {text}
    </Button>
  );
}
