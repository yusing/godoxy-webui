"use client";

import { SettingsItem } from "@/types/settings";
import { HStack, Text, TextProps } from "@chakra-ui/react";
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
  valueKey: string;
  initialValue: string | number | symbol;
  values: Record<string | number | symbol, number>;
  label: string;
}

export const LocalStorageSlider = React.forwardRef<
  HTMLDivElement,
  LocalStorageSliderProps
>(function LocalStorageSlider(props, ref) {
  const { valueKey, initialValue, values, label, ...rest } = props;
  const [value, setValue] = useLocalStorage(valueKey, initialValue);
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

interface LocalStorageNumberSliderProps extends Omit<SliderProps, "value"> {
  valueKey: string;
  initialValue: number;
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
  const { valueKey, initialValue, values, label, ...rest } = props;
  const [value, setValue] = useLocalStorage(valueKey, initialValue);
  return (
    <Slider
      min={0}
      max={values[values.length - 1]!.value}
      step={1}
      value={[value]}
      onValueChange={(e) => setValue(e.value[0]!)}
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
