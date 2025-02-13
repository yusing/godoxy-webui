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
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuRoot,
} from "@/components/ui/menu";
import {
  formatHealthInfo,
  healthInfoUnknown,
  useHealthInfo,
} from "@/types/api/health";
import { overrideHomepage } from "@/types/api/homepage";
import { type HomepageItem } from "@/types/api/route/homepage_item";
import {
  Group,
  HStack,
  Input,
  Link,
  Portal,
  Spacer,
  Span,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { HealthStatus } from "../health_status";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { SkeletonCircle, SkeletonText } from "../ui/skeleton";
import { FavIcon } from "./favicon";

import { toastError } from "@/types/api/endpoints";
import {
  FieldErrors,
  useController,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { LuEyeOff, LuPencil } from "react-icons/lu";
import { IconSearcher } from "../config_editor/icon_searcher";
import HealthProvider from "./health_provider";
import { useAllSettings } from "./settings";

type AppCardProps = {
  item: HomepageItem;
} & React.ComponentProps<typeof HStack>;

const AppCardToolTip = ({ item }: { item: HomepageItem }) => {
  const health = useHealthInfo(item.alias) ?? healthInfoUnknown;
  return (
    <Tooltip.Content
      fontSize="sm"
      fontWeight="medium"
      bg="bg.subtle"
      color="gray.300"
    >
      {health.status === "unknown" ? (
        <Text>{item.url}</Text>
      ) : (
        <Text>
          {formatHealthInfo(health)}
          <br />
          <Span>{item.url}</Span>
        </Text>
      )}
    </Tooltip.Content>
  );
};

const AppCardHealthBubble = ({ item }: { item: HomepageItem }) => {
  const { healthBubbleAlignEnd } = useAllSettings();
  const health = useHealthInfo(item.alias) ?? healthInfoUnknown;
  return (
    <>
      {healthBubbleAlignEnd.val ? <Spacer /> : null}
      <HealthStatus value={health.status} />
    </>
  );
};

export const AppCardInner: React.FC<AppCardProps> = ({ item, ...rest }) => {
  const portalRef = React.useRef<HTMLDivElement>(null);
  return (
    <HStack gap="2" w="full" {...rest}>
      {item.icon ? (
        <FavIcon url={item.icon} size={"24px"} />
      ) : (
        <FavIcon item={item} size={"24px"} />
      )}
      <Tooltip.Root openDelay={100}>
        <Tooltip.Trigger asChild>
          <Stack gap={0}>
            <Text fontWeight="medium">{item.name}</Text>
            {item.description && (
              <Text fontSize="sm" fontWeight="light" color="fg.muted">
                {item.description}
              </Text>
            )}
          </Stack>
        </Tooltip.Trigger>
        <Portal container={portalRef}>
          <Tooltip.Positioner>
            <AppCardToolTip item={item} />
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <AppCardHealthBubble item={item} />
    </HStack>
  );
};

export const AppCard: React.FC<AppCardProps> = ({ ...rest }) => {
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

  if (!curItem.show) {
    return null;
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
          className="transform transition-transform hover:scale-105"
          href={curItem.url}
          target="_blank"
          variant={"plain"}
          aria-label={curItem.name}
        >
          <HealthProvider>
            <AppCardInner item={curItem} />
          </HealthProvider>
        </Link>
      </MenuContextTrigger>
      <MenuContent>
        <MenuItem value="edit" aria-label="Edit app">
          <LuPencil />
          <EditItemButton
            item={curItem}
            onUpdate={(e) => {
              // rest.item.category = e.category;
              setCurItem(e);
              setMenuOpen(false);
            }}
          />
        </MenuItem>
        <MenuItem
          value="hide"
          aria-label="Hide app"
          onClick={() => {
            curItem.show = false;
            overrideHomepage("item_visible", [curItem.alias], false)
              .then(() => {
                setCurItem({ ...curItem, show: false });
                setMenuOpen(false);
              })
              .catch(toastError);
          }}
        >
          <LuEyeOff />
          Hide App
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

  const onSubmit = (data: HomepageItem) => {
    if (data.icon == "") {
      data.icon = item.icon;
    }
    overrideHomepage("item", data.alias, data)
      .then(() => overrideHomepage("item_visible", [data.alias], true))
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
      <DialogTrigger>Edit App</DialogTrigger>
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
              <IconSearcher
                value={iconField.value}
                onChange={iconField.onChange}
              />
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </Stack>
          </form>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
