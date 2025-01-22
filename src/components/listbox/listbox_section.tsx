import { For, Stack, StackProps, Text } from "@chakra-ui/react";
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
  ListboxSectionProps & Omit<StackProps, "children">
>(function ListboxSection(props, ref) {
  const { title, items, children, ...rest } = props;
  const isFunction = typeof children === "function";
  if (isFunction && !items) {
    throw new Error("items is required when children is a function");
  }
  return (
    <Stack gap="3" ref={ref} {...rest}>
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
