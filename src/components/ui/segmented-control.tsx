"use client";

import { For, SegmentGroup } from "@chakra-ui/react";
import * as React from "react";

interface Item {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends SegmentGroup.RootProps {
  items: ReadonlyArray<string | Item>;
}

function normalize(items: ReadonlyArray<string | Item>): Item[] {
  return items.map((item) => {
    if (typeof item === "string") return { value: item, label: item };
    return item;
  });
}

export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(props, ref) {
  const { items, ...rest } = props;
  const data = React.useMemo(() => normalize(items), [items]);

  return (
    <SegmentGroup.Root
      ref={ref}
      {...rest}
      bg={rest.bg ? rest.bg : "bg.emphasized"}
      borderRadius={"xl"}
    >
      <For each={data}>
        {(item) => (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            w={rest.w === "full" ? "full" : undefined}
            justifyContent={"center"}
            borderRadius={"xl"}
          >
            <SegmentGroup.ItemText fontWeight={"medium"} borderRadius={"xl"}>
              {item.label}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        )}
      </For>
      <SegmentGroup.Indicator bg={"bg.subtle"} borderRadius={"xl"} />
    </SegmentGroup.Root>
  );
});
