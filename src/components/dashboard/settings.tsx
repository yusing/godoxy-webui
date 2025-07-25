"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";
import { SettingsItem, useSetting } from "@/hooks/settings";
import Endpoints, { toastError } from "@/types/api/endpoints";
import { overrideHomepage } from "@/types/api/homepage";
import { type HomepageItem } from "@/types/api/route/homepage_item";
import { getRouteProviders } from "@/types/api/route_provider";
import { HStack, Icon, Stack, Tabs } from "@chakra-ui/react";
import React from "react";
import { AiOutlineLayout } from "react-icons/ai";
import { IoMdApps } from "react-icons/io";
import { MdViewComfy, MdViewCompact } from "react-icons/md";
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
  getHiddenApps,
}: Readonly<{
  size?: "sm" | "md" | "lg";
  getHiddenApps: () => HomepageItem[];
}>) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <SettingsButton title="Settings" iconProps={{ size: size ?? "sm" }}>
      <Tabs.Root
        lazyMount
        unmountOnExit
        defaultValue="layout"
        colorPalette={"teal"}
      >
        <Tabs.List gap="6">
          <Tabs.Trigger value="layout">
            <AiOutlineLayout />
            Layout
          </Tabs.Trigger>
          <Tabs.Trigger value="hidden_apps">
            <IoMdApps />
            Hidden Apps
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="layout" ref={contentRef}>
          <Stack gap={3}>
            {/* @ts-ignore */}
            <DashboardFilters portalRef={contentRef} />
            <ViewToggle />
            <HealthBubbleAlignSelect />
            <ItemGapSlider />
            <CategoryFontSizeSlider />
            <CategoryGroupGapSlider />
            <CategoryGroupPaddingXSlider />
            <CategoryGroupPaddingYSlider />
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="hidden_apps">
          <HiddenApps getHiddenApps={getHiddenApps} />
        </Tabs.Content>
      </Tabs.Root>
    </SettingsButton>
  );
}

export const useAllSettings = () => ({
  gridMode: useSetting("dashboard_grid_mode", true),
  itemGap: useSetting("dashboard_item_gap", 6),
  healthBubbleAlign: useSetting<0 | 1 | 2>("dashboard_health_bubble_align", 0),
  categoryGroupGap: useSetting("dashboard_category_group_gap", 3),
  categoryPaddingX: useSetting("dashboard_category_padding_x", 4),
  categoryPaddingY: useSetting("dashboard_category_padding_y", 4),
  categoryFontSize: useSetting<SizeKeys>("dashboard_category_font_size", "lg"),

  categoryFilter: useSetting("dashboard_category_filter", ""),
  providerFilter: useSetting("dashboard_provider_filter", ""),
});

function HiddenApps({
  getHiddenApps,
}: Readonly<{ getHiddenApps: () => HomepageItem[] }>) {
  const [selected, { push, removeAt, clear }] = useList<string>();

  const hiddenApps = getHiddenApps();

  if (hiddenApps.length === 0) {
    return <EmptyState icon={<MdViewComfy />} title="No apps" />;
  }
  return (
    <Stack gap={4}>
      <Stack maxH="500px" overflow="auto" gap="2">
        {hiddenApps.map((app) => (
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
            <HStack>
              <AppCardInner item={app} disableTooltip />
              {app.category && <Tag>{app.category}</Tag>}
            </HStack>
          </Checkbox>
        ))}
      </Stack>
      <HStack mx="3" justify={"space-between"}>
        <Button
          onClick={() =>
            overrideHomepage("item_visible", selected, true)
              .then(() => {
                selected.forEach((alias) => {
                  hiddenApps.find((item) => item.alias === alias)!.show = true;
                });
                clear();
              })
              .catch(toastError)
          }
        >
          Unhide
        </Button>
        <Button onClick={clear} variant={"subtle"}>
          Clear
        </Button>
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

function HealthBubbleAlignSelect() {
  const { healthBubbleAlign } = useAllSettings();
  return (
    <LocalStorageSlider
      item={healthBubbleAlign as SettingsItem<number>}
      label="Align Health Bubble"
      min={0}
      max={2}
      step={1}
      labels={["Left", "Right", "End"]}
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

export default function DashboardFilters({
  portalRef,
}: Readonly<{ portalRef?: React.RefObject<HTMLElement> }>) {
  const providers = useAsync(async () => getRouteProviders());
  const categories = useAsync(async () =>
    fetch(Endpoints.LIST_HOMEPAGE_CATEGORIES)
      .then((res) => res.json())
      .then((res) => res as string[]),
  );

  const providerCollection = React.useMemo(
    () =>
      createSelectCollection(providers.value?.map((p) => p.short_name) ?? []),
    [providers.value],
  );

  const categoryCollection = React.useMemo(
    () => createSelectCollection(categories.value ?? []),
    [categories.value],
  );

  const { categoryFilter, providerFilter } = useAllSettings();

  if (providers.error || categories.error) {
    toastError(providers.error ?? categories.error);
    return null;
  }

  return (
    <Stack gap={2}>
      <LocalStorageSelect
        item={categoryFilter}
        collection={categoryCollection}
        label="Category"
        portalRef={portalRef}
      />
      <LocalStorageSelect
        item={providerFilter}
        collection={providerCollection}
        label="Provider"
        portalRef={portalRef}
      />
    </Stack>
  );
}
