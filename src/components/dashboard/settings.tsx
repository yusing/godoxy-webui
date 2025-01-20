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
      </Stack>
    </SettingsButton>
  );
}

export const useAllSettings = () => ({
  gridMode: useSetting("dashboard_grid_mode", true),
  itemGap: useSetting("dashboard_item_gap", 10),
  cardPadding: useSetting("dashboard_card_padding", "2"),
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
      label="Category Filter"
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
      label="Provider Filter"
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
    <Stack gap={4}>
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
