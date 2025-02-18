import { HStack, Stack } from "@chakra-ui/react";

import { Button, PopoverArrow, Table } from "@chakra-ui/react";

import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Slider } from "../ui/slider";

import { Radio, RadioGroup } from "@/components/ui/radio";
import { useSetting } from "@/hooks/settings";
import { LuSettings } from "react-icons/lu";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { SegmentedControl } from "../ui/segmented-control";

export type UptimeLayout = "square_card" | "rect_card" | "default";
export function useLayoutMode() {
  const layoutMode = useSetting<UptimeLayout>(
    "metrics_uptime_layout_mode",
    "default",
  );
  return layoutMode;
}

export function useSquareCardSize() {
  const cardSize = useSetting<number>("metrics_uptime_square_card_size", 240);
  return cardSize;
}

export function useRowsCount() {
  const rowsCount = useSetting<number>("metrics_uptime_rows_count", 3);
  return rowsCount;
}

export function useColsCount() {
  const colsCount = useSetting<number>("metrics_uptime_cols_count", 2);
  return colsCount;
}

export function useRowGap() {
  const rowGap = useSetting<number>("metrics_uptime_row_gap", 4);
  return rowGap;
}

export function useColsGap() {
  const colsGap = useSetting<number>("metrics_uptime_cols_gap", 4);
  return colsGap;
}

export function useTemperatureUnit() {
  const temperatureUnit = useSetting<"celsius" | "fahrenheit">(
    "metrics_temperature_unit",
    "celsius",
  );
  return temperatureUnit;
}

export function MetricsSettings() {
  const rowsCount = useRowsCount();
  const colsCount = useColsCount();
  const rowGap = useRowGap();
  const colsGap = useColsGap();
  const temperatureUnit = useTemperatureUnit();
  const layoutMode = useLayoutMode();
  const squareCardSize = useSquareCardSize();
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
    >
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <LuSettings />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent w="400px">
        <PopoverArrow />
        <PopoverBody asChild>
          <Table.Root>
            <Table.ColumnGroup>
              <Table.Column />
              <Table.Column htmlWidth="35%" />
            </Table.ColumnGroup>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Layout</Table.ColumnHeader>
                <Table.ColumnHeader>Preferences</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <HStack gap="2">
                    <Label>Style</Label>
                    <SegmentedControl
                      size="sm"
                      borderRadius="md"
                      items={[
                        { label: "Default", value: "default" },
                        { label: "Square", value: "square_card" },
                        { label: "Minimal", value: "rect_card" },
                      ]}
                      value={layoutMode.val}
                      onValueChange={({ value }) =>
                        layoutMode.set(value as UptimeLayout)
                      }
                    />
                  </HStack>
                  {layoutMode.val === "square_card" && (
                    <Stack gap="2">
                      <Slider
                        label={`Square Card Size (${squareCardSize.val}px)`}
                        min={100}
                        max={300}
                        step={10}
                        value={[squareCardSize.val]}
                        onValueChange={({ value }) =>
                          squareCardSize.set(value[0]!)
                        }
                      />
                    </Stack>
                  )}
                  <Stack gap="2">
                    <Slider
                      label={`Rows (${rowsCount.val})`}
                      min={1}
                      max={15}
                      step={1}
                      value={[rowsCount.val]}
                      onValueChange={({ value }) => rowsCount.set(value[0]!)}
                    />
                    <Slider
                      label={`Columns (${colsCount.val})`}
                      min={1}
                      max={10}
                      step={1}
                      value={[colsCount.val]}
                      onValueChange={({ value }) => colsCount.set(value[0]!)}
                    />
                    <Slider
                      label={`Row Gap (${rowGap.val})`}
                      min={0}
                      max={10}
                      step={1}
                      value={[rowGap.val]}
                      onValueChange={({ value }) => rowGap.set(value[0]!)}
                    />
                    <Slider
                      label={`Column Gap (${colsGap.val})`}
                      min={0}
                      max={10}
                      step={1}
                      value={[colsGap.val]}
                      onValueChange={({ value }) => colsGap.set(value[0]!)}
                    />
                  </Stack>
                </Table.Cell>
                <Table.Cell asChild>
                  <Stack gap="2">
                    <Field label="Temperature Unit">
                      <RadioGroup
                        value={temperatureUnit.val}
                        onValueChange={({ value }) =>
                          temperatureUnit.set(value as "fahrenheit" | "celsius")
                        }
                      >
                        <HStack gap="4">
                          <Radio value="celsius">°C</Radio>
                          <Radio value="fahrenheit">°F</Radio>
                        </HStack>
                      </RadioGroup>
                    </Field>
                  </Stack>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}
