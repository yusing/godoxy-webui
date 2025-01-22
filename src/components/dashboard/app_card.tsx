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
import React, { useMemo } from "react";
import { HealthStatus } from "../health_status";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";
import { FavIcon } from "./favicon";

import { useTheme } from "next-themes";
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
  const [menuOpen, setMenuOpen] = React.useState(false);

  if (curItem.skeleton) {
    return (
      <HStack {...rest}>
        <SkeletonCircle size="24px" />
        <SkeletonText noOfLines={1} width="120px" />
      </HStack>
    );
  }
  return (
    <MenuRoot
      open={menuOpen}
      onOpenChange={({ open }) => setMenuOpen(open)}
      lazyMount
      unmountOnExit
      closeOnSelect={false}
    >
      <MenuContextTrigger asChild>
        <Link
          className="transform transition-transform hover:scale-110"
          href={curItem.url}
          target="_blank"
          variant="plain"
          aria-label={curItem.name}
        >
          <HStack gap="2">
            {curItem.icon ? (
              <FavIcon url={curItem.icon} size={"24px"} />
            ) : (
              <FavIcon item={curItem} size={"24px"} />
            )}
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
          <EditItemButton
            item={curItem}
            onUpdate={(e) => {
              setCurItem(e);
              setMenuOpen(false);
            }}
          />
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
  const { resolvedTheme } = useTheme();
  const oppositeTheme = resolvedTheme === "light" ? "dark" : "light";
  const item_ = useMemo(() => structuredClone(item), [item]);

  if (!item_.icon) {
    item_.icon = item_.name
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("_", "-");
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HomepageItem>({
    defaultValues: item_,
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
    () =>
      fetch(url)
        .then((r) => r.json() as Promise<Icon[]>)
        .then((r) =>
          r.toSorted(
            (a, b) => b.includes(oppositeTheme) - a.includes(oppositeTheme),
          ),
        ),
    [iconField.value],
  );

  const onSubmit = (data: HomepageItem) => {
    if (data.icon == "") {
      data.icon = item.icon;
    }
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
            <Stack gap="6" p="2">
              <HStack gap="6">
                <FavIcon url={iconField.value || item.icon} size="36px" />
                <Group gap="4" w="full">
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
              </HStack>
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
                        p="0"
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
                          <FavIcon url={e} size="28px" />
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
