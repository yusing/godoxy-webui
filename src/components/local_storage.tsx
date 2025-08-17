"use client";

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { type SettingsItem } from "@/hooks/settings";
import {
  Box,
  createListCollection,
  HStack,
  type ListCollection,
  Select,
  Text,
  type TextProps,
} from "@chakra-ui/react";
import React from "react";
import { Label } from "./ui/label";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "./ui/segmented-control";
import { Slider, type SliderProps } from "./ui/slider";
import { Switch, type SwitchProps } from "./ui/switch";

export const sizeKeys = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
export type SizeKeys = (typeof sizeKeys)[number];

interface LocalStorageSliderProps extends Omit<SliderProps, "value"> {
  item: SettingsItem<number>;
  min: number;
  max: number;
  step?: number;
  labels?: string[];
  label: string;
}

export const LocalStorageSlider = React.forwardRef<
  HTMLDivElement,
  LocalStorageSliderProps
>(function LocalStorageSlider(props, ref) {
  const { item, min, max, step, labels, label, ...rest } = props;
  return (
    <Slider
      min={min}
      max={max}
      step={step ?? 1}
      value={[item.val]}
      onValueChange={(e) => item.set(e.value[0]!)}
      label={label}
      marks={
        labels
          ? labels.map((label, index) => ({ value: index, label }))
          : [
              { value: min, label: String(min) },
              { value: max, label: String(max) },
            ]
      }
      {...rest}
      ref={ref}
    />
  );
});

interface LocalStorageStringSliderProps<T extends string>
  extends Omit<SliderProps, "value"> {
  item: SettingsItem<T>;
  labels: Readonly<Array<T>>;
  label: string;
}

export function LocalStorageStringSlider<T extends string>(
  props: Readonly<LocalStorageStringSliderProps<T>>,
) {
  const { item, labels, label, ...rest } = props;
  return (
    <Slider
      min={0}
      max={labels.length - 1}
      step={1}
      value={[labels.indexOf(item.val)]}
      onValueChange={(e) => item.set(labels[e.value[0]!]!)}
      label={label}
      marks={labels.map((label, index) => ({ value: index, label }))}
      {...rest}
    />
  );
}

interface LocalStorageSelectProps<T = string>
  extends Omit<Select.ControlProps, "value"> {
  item: SettingsItem<T>;
  collection: ListCollection<T>;
  label: string;
  portalRef?: React.RefObject<HTMLDivElement>;
}

export const LocalStorageSelectShowAll = "Show All";

export function createSelectCollection(items: string[]) {
  return createListCollection({
    items: [LocalStorageSelectShowAll, ...items],
    itemToString: (item) => item,
    itemToValue: (item) => {
      if (item === LocalStorageSelectShowAll) return "";
      return item;
    },
  });
}

export function LocalStorageSelect(props: LocalStorageSelectProps) {
  const { item, collection, label, portalRef, ...rest } = props;
  return (
    <SelectRoot
      positioning={{ sameWidth: true }}
      collection={collection}
      gap="0"
      defaultValue={[collection.firstValue ?? item.val]}
      value={[item.val]}
      onValueChange={({ value }) => {
        if (value[0] === LocalStorageSelectShowAll) {
          return item.set("");
        }
        return item.set(value[0]!);
      }}
    >
      <SelectLabel>{label}</SelectLabel>
      <SelectTrigger {...rest}>
        <SelectValueText />
      </SelectTrigger>
      <SelectContent w="full" portalRef={portalRef}>
        {collection.items.map((e) => (
          <SelectItem key={e} item={e}>
            {e === "" ? LocalStorageSelectShowAll : e}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

interface LocalStorageToggleProps extends Omit<SwitchProps, "value"> {
  item: SettingsItem<boolean>;
  label: string;
  labelPlacement?: "start" | "end";
  labelProps?: TextProps;
}

export const LocalStorageToggle = React.forwardRef<
  HTMLDivElement,
  LocalStorageToggleProps
>(function LocalStorageToggle(props, ref) {
  const { item, label, labelPlacement, labelProps, ...rest } = props;
  return (
    <Box ref={ref}>
      <Switch
        checked={item.val}
        onCheckedChange={(e) => item.set(e.checked)}
        labelPlacement={labelPlacement}
        {...rest}
      >
        <Text {...labelProps}>{label}</Text>
      </Switch>
    </Box>
  );
});

interface LocalStorageSegmentedControlProps<T extends string>
  extends Omit<SegmentedControlProps, "value" | "items"> {
  item: SettingsItem<T>;
  items: Readonly<Array<{ label: string; value: T }>>;
  label: string;
}

export function LocalStorageSegmentedControl<T extends string>(
  props: Readonly<LocalStorageSegmentedControlProps<T>>,
) {
  const { item, label, items, ...rest } = props;
  return (
    <HStack gap={2}>
      <Label>{label}</Label>
      <SegmentedControl
        items={items}
        value={item.val}
        onValueChange={({ value }) => item.set(value as T)}
        {...rest}
      />
    </HStack>
  );
}
