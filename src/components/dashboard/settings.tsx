"use client";

import Endpoints from "@/types/api/endpoints";
import { useSetting } from "@/types/settings";
import { Icon, ListCollection, Stack } from "@chakra-ui/react";
import React from "react";
import { MdViewComfy, MdViewCompact } from "react-icons/md";
import { useAsync } from "react-use";
import {
  createSelectCollection,
  LocalStorageNumberSlider,
  LocalStorageSelect,
  LocalStorageSlider,
  LocalStorageToggle,
  Sizes,
} from "../local_storage";
import { SettingsButton } from "../settings_button";

export function DashboardSettingsButton({
  size,
}: Readonly<{
  size?: "sm" | "md" | "lg";
}>) {
  return (
    <SettingsButton title="Layout Settings" iconProps={{ size: size ?? "sm" }}>
      <Stack gap={4}>
        <ViewToggle />
        <ItemGapSlider />
        <CategoryFontSizeSlider />
        <CategoryGroupGapSlider />
        <CategoryGroupPaddingXSlider />
        <CategoryGroupPaddingYSlider />
      </Stack>
    </SettingsButton>
  );
}

export const useAllSettings = () => ({
  gridMode: useSetting("dashboard_grid_mode", true),
  itemGap: useSetting("dashboard_item_gap", 10),
  categoryGroupGap: useSetting("dashboard_category_group_gap", 3),
  categoryPaddingX: useSetting("dashboard_category_padding_x", 6),
  categoryPaddingY: useSetting("dashboard_category_padding_y", 6),
  categoryFontSize: useSetting("dashboard_category_font_size", "lg"),

  categoryFilter: useSetting("dashboard_category_filter", ""),
  providerFilter: useSetting("dashboard_provider_filter", ""),
});

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
    <LocalStorageNumberSlider
      item={itemGap}
      values={[
        { value: 0, label: "none" },
        { value: 5, label: "sm" },
        { value: 10, label: "md" },
        { value: 15, label: "lg" },
        { value: 20, label: "xl" },
      ]}
      label="Item Gap"
    />
  );
}

function CategoryGroupGapSlider() {
  const { categoryGroupGap } = useAllSettings();
  return (
    <LocalStorageNumberSlider
      item={categoryGroupGap}
      values={[
        { value: 0, label: "none" },
        { value: 2, label: "sm" },
        { value: 4, label: "md" },
        { value: 6, label: "lg" },
        { value: 8, label: "xl" },
      ]}
      label="Category Group Gap"
    />
  );
}

function CategoryGroupPaddingXSlider() {
  const { categoryPaddingX: cardPadding } = useAllSettings();
  return (
    <LocalStorageNumberSlider
      item={cardPadding}
      values={[
        { value: 2, label: "sm" },
        { value: 6, label: "md" },
        { value: 10, label: "lg" },
        { value: 14, label: "xl" },
      ]}
      label="Category Group Padding X"
    />
  );
}

function CategoryGroupPaddingYSlider() {
  const { categoryPaddingY: cardPadding } = useAllSettings();
  return (
    <LocalStorageNumberSlider
      item={cardPadding}
      values={[
        { value: 0, label: "none" },
        { value: 2, label: "sm" },
        { value: 4, label: "md" },
        { value: 6, label: "lg" },
        { value: 8, label: "xl" },
      ]}
      label="Category Group Padding Y"
    />
  );
}

function CategoryFontSizeSlider() {
  const { categoryFontSize } = useAllSettings();

  return (
    <LocalStorageSlider
      item={categoryFontSize}
      values={Sizes}
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
