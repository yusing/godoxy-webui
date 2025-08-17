import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuRoot,
} from "@/components/ui/menu";
import { healthInfoUnknown } from "@/types/api/health";
import {
  DialogRootProvider,
  Group,
  HStack,
  Input,
  Link,
  Portal,
  Spacer,
  Stack,
  type StackProps,
  Text,
  Tooltip,
  useDialog,
} from "@chakra-ui/react";
import React, { memo, useMemo, useState } from "react";
import { HealthStatus } from "../health_status";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { FavIcon } from "./favicon";

import { useHealthInfo } from "@/hooks/health_map";
import type { HomepageItem } from "@/lib/api";
import { api } from "@/lib/api-client";
import { formatDuration } from "@/lib/format";
import { toastError } from "@/lib/toast";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type FieldErrors,
  useController,
  useForm,
  type UseFormRegister,
} from "react-hook-form";
import { LuEyeOff, LuInfo, LuPencil } from "react-icons/lu";
import { useAsync } from "react-use";
import { IconSearcher } from "../config_editor/icon_searcher";
import { FullDetailDialog } from "../proxies/full_detail_dialog";
import { DataListItem, DataListRoot } from "../ui/data-list";
import { useAllSettings } from "./settings";

interface AppCardInnerProps extends StackProps {
  item: HomepageItem;
  disableTooltip: boolean;
}

const AppCardToolTip = ({ item }: { item: HomepageItem }) => {
  const health = useHealthInfo(item.alias) ?? healthInfoUnknown;
  return (
    <Tooltip.Content
      fontSize="sm"
      fontWeight="medium"
      bg="bg.subtle"
      color="gray.300"
    >
      <DataListRoot size="sm">
        <DataListItem label="Status" value={health.status} />
        <DataListItem
          label="Uptime"
          value={formatDuration(health.uptime, { unit: "ms" })}
        />
        <DataListItem
          label="Latency"
          value={formatDuration(health.latency, { unit: "us" })}
        />
        <DataListItem label="URL" value={item.url} />
        {health.detail && (
          <DataListItem
            label="Detail"
            value={health.detail}
            textWrap={"pretty"}
            whiteSpace={"wrap"}
            maxLines={3}
            overflowY="auto"
          />
        )}
      </DataListRoot>
    </Tooltip.Content>
  );
};

const AppCardHealthBubbleLeft = ({ item }: { item: HomepageItem }) => {
  const { healthBubbleAlign } = useAllSettings();
  const health = useHealthInfo(item.alias) ?? healthInfoUnknown;
  if (health.status === "unknown") {
    return null;
  }
  if (healthBubbleAlign.val === 0) {
    return <HealthStatus value={health.status} />;
  }
  return null;
};

const AppCardHealthBubbleRight = ({ item }: { item: HomepageItem }) => {
  const { healthBubbleAlign } = useAllSettings();
  const health = useHealthInfo(item.alias) ?? healthInfoUnknown;
  if (health.status === "unknown") {
    return null;
  }
  switch (healthBubbleAlign.val) {
    case 1:
      return <HealthStatus value={health.status} />;
    case 2:
      return (
        <>
          <Spacer />
          <HealthStatus value={health.status} />
        </>
      );
    default:
      return null;
  }
};

export const AppCardInner = memo<AppCardInnerProps>(
  ({ item, disableTooltip, ...rest }) => {
    const portalRef = React.useRef<HTMLDivElement>(null);
    return (
      <Tooltip.Root
        openDelay={100}
        closeDelay={300}
        interactive
        closeOnClick={false}
        closeOnPointerDown={false}
        closeOnScroll={false}
        open={disableTooltip ? false : undefined}
        positioning={{ placement: "bottom-end" }}
      >
        <Tooltip.Trigger asChild>
          <HStack gap="2" {...rest} w="full">
            <AppCardHealthBubbleLeft item={item} />
            {item.icon ? (
              <FavIcon url={item.icon} size={"24px"} />
            ) : (
              <FavIcon item={item} size={"24px"} />
            )}
            <Stack gap={0}>
              <Text fontWeight="medium">{item.name}</Text>
              {item.description && (
                <Text fontSize="sm" fontWeight="light" color="fg.muted">
                  {item.description}
                </Text>
              )}
            </Stack>
            <AppCardHealthBubbleRight item={item} />
          </HStack>
        </Tooltip.Trigger>
        <Portal container={portalRef}>
          <Tooltip.Positioner>
            <AppCardToolTip item={item} />
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
    );
  },
);

AppCardInner.displayName = "AppCardInner";

export const AppCard = memo<Omit<AppCardInnerProps, "dragging">>(
  ({ ...rest }) => {
    const [curItem, setCurItem] = React.useState(rest.item);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: curItem.alias,
    });

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : undefined,
        boxShadow: isDragging ? "rgba(0, 0, 0, 0.2) 0px 8px 24px" : undefined,
      }),
      [transform, transition, isDragging],
    );

    if (!curItem.show) {
      return null;
    }

    return (
      <>
        <MenuRoot
          open={menuOpen}
          onOpenChange={({ open }) => setMenuOpen(open)}
          lazyMount
          unmountOnExit
          closeOnSelect
        >
          <MenuContextTrigger asChild>
            <Link
              ref={setNodeRef}
              style={style}
              {...attributes}
              {...listeners}
              transition={"transform 0.1s ease-in-out"}
              _hover={{ transform: "scale(1.02)" }}
              href={curItem.url}
              target="_blank"
              variant={"plain"}
              aria-label={curItem.name}
            >
              <AppCardInner
                item={curItem}
                disableTooltip={isDragging || menuOpen}
              />
            </Link>
          </MenuContextTrigger>
          <MenuContent>
            <MenuItem
              value="edit"
              aria-label="Edit app"
              onClick={(e) => {
                e.preventDefault();
                setIsEditDialogOpen(true);
                setMenuOpen(false);
              }}
            >
              <HStack gap="2">
                <LuPencil />
                Edit App
              </HStack>
            </MenuItem>
            <MenuItem
              value="hide"
              aria-label="Hide app"
              onClick={() => {
                api.homepage
                  .setItemVisible({
                    which: [curItem.alias],
                    value: false,
                  })
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
            <MenuItem
              value="detail"
              aria-label="Show details"
              onClick={() => {
                setIsDetailDialogOpen(true);
              }}
            >
              <LuInfo />
              Details
            </MenuItem>
          </MenuContent>
        </MenuRoot>
        {isEditDialogOpen && (
          <EditItemDialog
            item={curItem}
            isOpen={isEditDialogOpen}
            onUpdate={(updatedItem) => {
              setCurItem(updatedItem);
              setIsEditDialogOpen(false);
            }}
            onClose={() => {
              setIsEditDialogOpen(false);
            }}
          />
        )}
        {isDetailDialogOpen && (
          <DetailDialog
            item={curItem}
            onClose={() => {
              setIsDetailDialogOpen(false);
            }}
          />
        )}
      </>
    );
  },
);

AppCard.displayName = "AppCard";

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

// Rename EditItemButton to EditItemDialog and refactor
function EditItemDialog({
  item,
  isOpen,
  onUpdate,
  onClose,
}: Readonly<{
  item: HomepageItem | null;
  isOpen: boolean;
  onUpdate: (newItem: HomepageItem) => void;
  onClose: () => void;
}>) {
  if (!item) {
    return null;
  }

  const dialog = useDialog({
    open: isOpen,
    onOpenChange: ({ open }) => {
      if (!open) {
        onClose();
      }
    },
  });

  const item_ = useMemo(() => structuredClone(item), [item]);

  if (!item_.icon) {
    item_.icon = item_.name
      .split(".")[0]!
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

  const onSubmit = (newItem: HomepageItem) => {
    newItem.icon ??= item.icon;
    api.homepage
      .setItem({
        which: newItem.alias,
        value: newItem,
      })
      .then(() =>
        api.homepage.setItemVisible({
          which: [newItem.alias],
          value: true,
        }),
      )
      .then(() => {
        onUpdate(newItem);
      })
      .catch(toastError);
  };

  return (
    <DialogRootProvider
      placement={"center"}
      value={dialog}
      lazyMount
      unmountOnExit
    >
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
                <FavIcon
                  item={{ ...item, icon: iconField.value || item.icon }}
                  size="36px"
                />
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
                <Button type="submit" borderRadius={"lg"}>
                  Save
                </Button>
              </DialogFooter>
            </Stack>
          </form>
        </DialogBody>
      </DialogContent>
    </DialogRootProvider>
  );
}

function DetailDialog({
  item,
  onClose,
}: Readonly<{
  item: HomepageItem;
  onClose: () => void;
}>) {
  const route = useAsync(
    async () =>
      await api.route
        .route(item.alias)
        .then((e) => e.data)
        .catch(toastError),
  );
  const dialog = useDialog({
    open: true,
    onOpenChange: ({ open }) => {
      if (!open) {
        onClose();
      }
    },
  });

  if (!route.value) {
    return null;
  }

  return <FullDetailDialog route={route.value} dialog={dialog} />;
}
