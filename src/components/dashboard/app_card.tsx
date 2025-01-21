import { Tooltip } from "@/components/ui/tooltip";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuRoot,
} from "@/components/ui/menu";
import Endpoints, { toastError } from "@/types/api/endpoints";
import {
  MarshalItem,
  type HomepageItem,
} from "@/types/api/entry/homepage_item";
import { formatHealthInfo, type HealthInfo } from "@/types/api/health";
import { overrideHomepage, type Icon } from "@/types/api/homepage";
import {
  Group,
  HStack,
  Input,
  Link,
  Show,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { HealthStatus } from "../health_status";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";
import { FavIcon } from "./favicon";

import {
  FieldErrors,
  useController,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { MdError } from "react-icons/md";
import { useAsync } from "react-use";
import { CloseButton } from "../ui/close-button";
import { EmptyState } from "../ui/empty-state";

type AppCardProps = {
  item: HomepageItem;
  health: HealthInfo;
} & React.ComponentProps<typeof HStack>;

export const AppCard: React.FC<AppCardProps> = ({ health, ...rest }) => {
  const [curItem, setCurItem] = React.useState(rest.item);

  if (curItem.skeleton) {
    return (
      <HStack {...rest}>
        <SkeletonCircle size="24px" />
        <SkeletonText noOfLines={1} width="120px" />
      </HStack>
    );
  }
  return (
    <MenuRoot lazyMount unmountOnExit closeOnSelect={false}>
      <MenuContextTrigger asChild>
        <Link
          className="transform transition-transform hover:scale-110"
          href={curItem.url}
          target="_blank"
          variant="plain"
          aria-label={curItem.name}
        >
          <HStack gap="2">
            <FavIcon item={curItem} size={"24px"} />
            <Tooltip content={curItem.url}>
              <Stack gap={0}>
                <Text fontWeight="medium">{curItem.name}</Text>
                <Show when={curItem.description}>
                  <Text fontSize="sm" fontWeight="light" color="fg.muted">
                    {curItem.description}
                  </Text>
                </Show>
              </Stack>
            </Tooltip>
            <Spacer />
            {health.status !== "unknown" && (
              <Tooltip content={formatHealthInfo(health)}>
                <HealthStatus value={health.status} />
              </Tooltip>
            )}
          </HStack>
        </Link>
      </MenuContextTrigger>
      <MenuContent>
        <MenuItem value="edit" aria-label="Edit app">
          <EditItemButton item={curItem} onUpdate={(e) => setCurItem(e)} />
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
};

const FieldInput = ({
  label,
  field,
  required,
  errors,
  register,
}: {
  label: string;
  field: keyof HomepageItem;
  required?: boolean;
  errors: FieldErrors<HomepageItem>;
  register: UseFormRegister<HomepageItem>;
}) => (
  <Field
    label={label}
    invalid={required && !!errors[field]}
    errorText={errors[field]?.message}
  >
    <Input
      p="2"
      {...register(field, { required: required && `${label} is required` })}
    />
  </Field>
);

function EditItemButton({
  item,
  onUpdate,
}: Readonly<{
  item: HomepageItem;
  onUpdate: (newItem: HomepageItem) => void;
}>) {
  const [open, setOpen] = React.useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HomepageItem>({
    defaultValues: item,
  });

  const { field: iconField } = useController({
    control,
    name: "icon",
  });

  const url = React.useMemo(
    () => Endpoints.SearchIcons(iconField.value, 10),
    [iconField.value],
  );
  const icons = useAsync<() => Promise<Icon[]>>(
    () => fetch(url).then((r) => r.json()),
    [iconField.value],
  );

  const onSubmit = (data: HomepageItem) => {
    overrideHomepage("item", data.alias, MarshalItem(data))
      .then(() => {
        onUpdate(data);
        setOpen(false);
      })
      .catch(toastError);
  };

  return (
    <DialogRoot
      size="lg"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      lazyMount
      unmountOnExit
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit App
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontSize={"md"} fontWeight={"medium"}>
            Edit App
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="4">
              <Group gap="4">
                <FieldInput
                  required
                  label="App name"
                  field="name"
                  errors={errors}
                  register={register}
                />
                <FieldInput
                  label="Category"
                  field="category"
                  errors={errors}
                  register={register}
                />
              </Group>
              <FieldInput
                label="Description"
                field="description"
                errors={errors}
                register={register}
              />

              <Stack>
                <Field label="Icon">
                  <Group attached w="full">
                    <Input
                      p="2"
                      placeholder="Start typing to find an icon, or paste a URL"
                      value={iconField.value}
                      onChange={(e) => iconField.onChange(e.target.value)}
                    />
                    <CloseButton onClick={() => iconField.onChange("")} />
                  </Group>
                </Field>
                <Stack overflow={"scroll"} maxH="250px" minW={"full"}>
                  {icons.error ? (
                    <EmptyState
                      icon={<MdError />}
                      title={"Error loading icons"}
                    />
                  ) : !icons.value ? (
                    <EmptyState title={"No icons found"} />
                  ) : (
                    icons.value.map((e) => (
                      <Button
                        key={e}
                        asChild
                        onClick={() => iconField.onChange(e)}
                      >
                        <HStack
                          bg="bg.panel"
                          color="fg.info"
                          gap="2"
                          textAlign={"left"}
                          justify={"left"}
                        >
                          <FavIcon url={e} size="24px" />
                          <Text>{e}</Text>
                        </HStack>
                      </Button>
                    ))
                  )}
                </Stack>
              </Stack>
              <Button type="submit">Save</Button>
            </Stack>
          </form>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
