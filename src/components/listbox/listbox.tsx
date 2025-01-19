import { Stack } from "@chakra-ui/react";
import { ListboxItem } from "./listbox_item";
import { ListboxSection } from "./listbox_section";

export type ListboxProps = Readonly<{
  children: React.ReactElement;
}>;

function Listbox(props: ListboxProps) {
  return (
    <Stack gap={6} align="start">
      {props.children}
    </Stack>
  );
}

export { Listbox, ListboxItem, ListboxSection };
