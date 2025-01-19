import { HStack, Icon, StackProps, Text } from "@chakra-ui/react";
import React from "react";

type ListboxItemProps = Readonly<{
  icon: React.ReactNode;
  text?: string;
  children?: React.ReactNode;
  isSelected?: boolean;
  onPress?: () => void;
  textProps?: React.ComponentProps<typeof Text>;
}>;

export const ListboxItem = React.forwardRef<
  HTMLDivElement,
  ListboxItemProps & StackProps
>((props, ref) => {
  const { icon, text, children, isSelected, onPress, textProps, ...rest } =
    props;
  const fontSize = textProps?.fontSize ?? "sm";
  const color = isSelected ? "primary" : textProps?.color;
  const bg = isSelected ? "bg.mutex" : textProps?.bg;

  const ele = (
    <HStack as="button" ref={ref} background={bg} onClick={onPress} {...rest}>
      <Icon color={color}>{icon}</Icon>
      {text && (
        <Text color={color} fontSize={fontSize} {...textProps}>
          {text}
        </Text>
      )}
      {children}
    </HStack>
  );
  return ele;
});
