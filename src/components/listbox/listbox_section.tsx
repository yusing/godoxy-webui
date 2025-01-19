import { For, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { ListboxItem } from "./listbox_item";

export type ListboxSectionProps = Readonly<{
  title: string;
  items?: any[];
  children?:
    | React.ReactNode
    | ((item: any) => React.ComponentProps<typeof ListboxItem>);
}>;

export const ListboxSection = React.forwardRef<
  HTMLDivElement,
  ListboxSectionProps
>(function ListboxSection(props, ref) {
  const { title, items, children } = props;
  const isFunction = typeof children === "function";
  if (isFunction && !items) {
    throw new Error("items is required when children is a function");
  }
  return (
    <Stack gap="2" ref={ref}>
      <Text fontSize={"xs"} color="fg.muted">
        {title}
      </Text>
      {isFunction ? (
        <For each={items}>
          {(item) => {
            const { key, ...restProps } = children(item);
            return <ListboxItem {...restProps} key={key} />;
          }}
        </For>
      ) : (
        children
      )}
    </Stack>
  );
});
