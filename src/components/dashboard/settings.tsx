"use client";
import { Checkbox } from "@/components/ui/checkbox";
import Endpoints from "@/types/api/endpoints";
import { getHiddenHomepageItems } from "@/types/api/entry/homepage_item";
import { healthInfoUnknown } from "@/types/api/health";
import { useSetting } from "@/types/settings";
import {
  HStack,
  Icon,
  ListCollection,
  Spinner,
  Stack,
  Tabs,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineLayout } from "react-icons/ai";
import { IoMdApps } from "react-icons/io";
import { MdError, MdViewComfy, MdViewCompact } from "react-icons/md";
import { useAsync, useList } from "react-use";
import {
  createSelectCollection,
  LocalStorageSelect,
  LocalStorageSlider,
  LocalStorageStringSlider,
  LocalStorageToggle,
  SizeKeys,
  sizeKeys,
} from "../local_storage";
import { SettingsButton } from "../settings_button";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { AppCardInner } from "./app_card";

export function DashboardSettingsButton({
  size,
}: Readonly<{
  size?: "sm" | "md" | "lg";
}>) {
  return (
    <SettingsButton title="Settings" iconProps={{ size: size ?? "sm" }}>
      <Tabs.Root lazyMount unmountOnExit defaultValue="layout">
        <Tabs.List gap="6">
          <Tabs.Trigger value="layout">
            <AiOutlineLayout />
            Layout
          </Tabs.Trigger>
          <Tabs.Trigger value="hidden_apps">
            <IoMdApps />
            Hidden Apps
          </Tabs.Trigger>
          <Tabs.Indicator rounded="l2" />
        </Tabs.List>
        <Tabs.Content value="layout">
          <Stack gap={4}>
            <ViewToggle />
            <ItemGapSlider />
            <CategoryFontSizeSlider />
            <CategoryGroupGapSlider />
            <CategoryGroupPaddingXSlider />
            <CategoryGroupPaddingYSlider />
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="hidden_apps">
          <HiddenApps />
        </Tabs.Content>
      </Tabs.Root>
    </SettingsButton>
  );
}

export const useAllSettings = () => ({
  gridMode: useSetting("dashboard_grid_mode", true),
  itemGap: useSetting("dashboard_item_gap", 10),
  categoryGroupGap: useSetting("dashboard_category_group_gap", 3),
  categoryPaddingX: useSetting("dashboard_category_padding_x", 6),
  categoryPaddingY: useSetting("dashboard_category_padding_y", 6),
  categoryFontSize: useSetting<SizeKeys>("dashboard_category_font_size", "lg"),

  categoryFilter: useSetting("dashboard_category_filter", ""),
  providerFilter: useSetting("dashboard_provider_filter", ""),
});

function HiddenApps() {
  const apps = useAsync(getHiddenHomepageItems);
  const [selected, { push, removeAt, clear }] = useList<string>();

  if (apps.error) {
    return <EmptyState icon={<MdError />} title="Failed to load apps" />;
  }
  if (apps.loading) {
    return <EmptyState icon={<Spinner />} title="Loading apps" />;
  }
  if (apps.value && apps.value.length === 0) {
    return <EmptyState icon={<MdViewComfy />} title="No apps" />;
  }
  return (
    <Stack gap={4}>
      <Stack maxH="500px" overflow="auto">
        {apps.value?.map((app) => (
          <Checkbox
            key={app.alias}
            checked={selected.includes(app.alias)}
            onCheckedChange={({ checked }) => {
              if (checked) {
                push(app.alias);
              } else {
                removeAt(selected.indexOf(app.alias));
              }
            }}
          >
            <AppCardInner item={app} health={healthInfoUnknown} />
          </Checkbox>
        ))}
      </Stack>
      <HStack mx="3" justify={"space-between"}>
        <Button onClick={clear}>Clear</Button>
        <Button>Unhide</Button>
      </HStack>
    </Stack>
  );
}

function ViewToggle() {
  const { gridMode } = useAllSettings();
  return (
    <LocalStorageToggle
      item={gridMode}
      label={gridMode.val ? "Grid View" : "Stack View"}
      trackLabel={{
        on: (
          <Icon asChild color="fg.inverted">
            <MdViewComfy />
          </Icon>
        ),
        off: <MdViewCompact />,
      }}
    />
  );
}

function ItemGapSlider() {
  const { itemGap } = useAllSettings();
  return (
    <LocalStorageSlider item={itemGap} min={0} max={20} label="Item Gap" />
  );
}

function CategoryGroupGapSlider() {
  const { categoryGroupGap } = useAllSettings();
  return (
    <LocalStorageSlider
      item={categoryGroupGap}
      min={0}
      max={10}
      step={2}
      label="Category Group Gap"
    />
  );
}

function CategoryGroupPaddingXSlider() {
  const { categoryPaddingX: cardPadding } = useAllSettings();
  return (
    <LocalStorageSlider
      item={cardPadding}
      min={0}
      max={12}
      label="Category Group Padding X"
    />
  );
}

function CategoryGroupPaddingYSlider() {
  const { categoryPaddingY: cardPadding } = useAllSettings();
  return (
    <LocalStorageSlider
      item={cardPadding}
      min={0}
      max={12}
      label="Category Group Padding Y"
    />
  );
}
function CategoryFontSizeSlider() {
  const { categoryFontSize } = useAllSettings();

  return (
    <LocalStorageStringSlider
      item={categoryFontSize}
      labels={sizeKeys}
      label="Category Title Size"
    />
  );
}

function CategoryFilterSelect({
  collection,
}: Readonly<{ collection: ListCollection<string> }>) {
  const { categoryFilter } = useAllSettings();
  return (
    <LocalStorageSelect
      item={categoryFilter}
      collection={collection}
      label="Category"
    />
  );
}

function ProviderFilterSelect({
  collection,
}: Readonly<{ collection: ListCollection<string> }>) {
  const { providerFilter } = useAllSettings();
  return (
    <LocalStorageSelect
      item={providerFilter}
      collection={collection}
      label="Provider"
    />
  );
}

export default function DashboardFilters() {
  const providers = useAsync(
    async () =>
      (await fetch(Endpoints.LIST_ROUTE_PROVIDERS)
        .then((res) => res.json())
        .catch(() => [])) as string[],
  );
  const categories = useAsync(
    async () =>
      (await fetch(Endpoints.LIST_HOMEPAGE_CATEGORIES)
        .then((res) => res.json())
        .catch(() => [])) as string[],
  );

  return (
    <Stack gap={2}>
      <CategoryFilterSelect
        collection={React.useMemo(
          () => createSelectCollection(categories.value ?? []),
          [categories.value],
        )}
      />
      <ProviderFilterSelect
        collection={React.useMemo(
          () => createSelectCollection(providers.value ?? []),
          [providers.value],
        )}
      />
    </Stack>
  );
}
