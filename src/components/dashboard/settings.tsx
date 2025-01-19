"use client";

import { useSetting } from "@/types/settings";
import { Icon, Stack } from "@chakra-ui/react";
import { MdViewComfy, MdViewCompact } from "react-icons/md";
import {
  LocalStorageNumberSlider,
  LocalStorageSlider,
  LocalStorageToggle,
  Sizes,
} from "../local_storage";
import { SettingsButton } from "../settings_button";

export function DashboardSettingsButton({
  size,
}: Readonly<{ size?: "sm" | "md" | "lg" }>) {
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

export const allSettings = () => ({
  gridMode: useSetting("dashboard_grid_mode", true),
  itemGap: useSetting("dashboard_item_gap", 5),
  cardPadding: useSetting("dashboard_card_padding", "2"),
  categoryFontSize: useSetting("dashboard_category_font_size", "lg"),
});

function ViewToggle() {
  return (
    <LocalStorageToggle
      item={allSettings().gridMode}
      label={allSettings().gridMode.val ? "Grid View" : "Stack View"}
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
  return (
    <LocalStorageNumberSlider
      valueKey={allSettings().itemGap.key}
      initialValue={10}
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
  return (
    <LocalStorageSlider
      valueKey={allSettings().categoryFontSize.key}
      initialValue="lg"
      values={Sizes}
      label="Category Title Size"
    />
  );
}
