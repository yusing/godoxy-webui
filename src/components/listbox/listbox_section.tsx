import { For, Stack, type StackProps, Text } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import { ListboxItem, type ListboxItemProps } from "./listbox_item";

export type ListboxSectionProps = Readonly<{
  title: ReactNode;
  items?: any[];
  children?: ReactNode | ((item: any) => ListboxItemProps);
}>;

export const ListboxSection = forwardRef<
  HTMLDivElement,
  ListboxSectionProps & Omit<StackProps, "children">
>(function ListboxSection(props, ref) {
  const { title, items, children, ...rest } = props;
  const isFunction = typeof children === "function";
  if (isFunction && !items) {
    throw new Error("items is required when children is a function");
  }
  return (
    <Stack gap="0" ref={ref} {...rest}>
      <Text fontSize={"xs"} fontWeight={"medium"} color="fg.muted">
        {title}
      </Text>
      {isFunction ? (
        <Stack gap="0">
          <For each={items}>
            {(item) => {
              const { key, ...restProps } = children(item);
              return <ListboxItem {...restProps} key={key} />;
            }}
          </For>
        </Stack>
      ) : (
        children
      )}
    </Stack>
  );
});
