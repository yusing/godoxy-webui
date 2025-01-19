"use client";

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { SettingsItem } from "@/types/settings";
import {
  createListCollection,
  HStack,
  ListCollection,
  Select,
  Text,
  TextProps,
} from "@chakra-ui/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import React from "react";
import { Slider, SliderProps } from "./ui/slider";
import { Switch, SwitchProps } from "./ui/switch";

export type SizeKeys = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export const Sizes: Record<SizeKeys, number> = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
};

interface LocalStorageSliderProps extends Omit<SliderProps, "value"> {
  item: SettingsItem<string>;
  values: Record<string | number | symbol, number>;
  label: string;
}

export const LocalStorageSlider = React.forwardRef<
  HTMLDivElement,
  LocalStorageSliderProps
>(function LocalStorageSlider(props, ref) {
  const { item, values, label, ...rest } = props;
  const [value, setValue] = useLocalStorage(item.key, item.val);
  return (
    <Slider
      min={0}
      max={Object.keys(values).length - 1}
      step={1}
      value={[values[value]!]}
      onValueChange={(e) => setValue(Object.keys(values)[e.value[0]!]!)}
      label={label}
      marks={Object.entries(values).map((v) => ({
        value: values[v[0]]!,
        label: v[0],
      }))}
      {...rest}
      ref={ref}
    />
  );
});

interface LocalStorageSelectProps<T = string>
  extends Omit<Select.ControlProps, "value"> {
  item: SettingsItem<T>;
  collection: ListCollection<T>;
  label: string;
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

export const LocalStorageSelect = React.forwardRef<
  HTMLDivElement,
  LocalStorageSelectProps
>(function LocalStorageSelect(props, ref) {
  const { item, collection, label, ...rest } = props;
  return (
    <SelectRoot
      ref={ref}
      collection={collection}
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
      <SelectContent>
        {collection.items.map((e) => (
          <SelectItem key={e} item={e}>
            {e === "" ? LocalStorageSelectShowAll : e}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
});

interface LocalStorageNumberSliderProps extends Omit<SliderProps, "value"> {
  item: SettingsItem<number>;
  values: {
    label: string;
    value: number;
  }[];
  label: string;
}

export const LocalStorageNumberSlider = React.forwardRef<
  HTMLDivElement,
  LocalStorageNumberSliderProps
>(function LocalStorageSlider(props, ref) {
  const { item, values, label, ...rest } = props;
  return (
    <Slider
      min={0}
      max={values[values.length - 1]!.value}
      step={1}
      value={[item.val]}
      onValueChange={(e) => item.set(e.value[0]!)}
      label={label}
      marks={values}
      {...rest}
      ref={ref}
    />
  );
});

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
    <HStack ref={ref}>
      <Switch
        checked={item.val}
        onCheckedChange={(e) => item.set(e.checked)}
        labelPlacement={labelPlacement}
        {...rest}
      >
        <Text {...labelProps}>{label}</Text>
      </Switch>
    </HStack>
  );
});
