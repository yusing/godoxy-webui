import {
  HStack,
  type StackProps,
  Text,
  type TextProps,
} from "@chakra-ui/react";
import { type PropsWithChildren, type ReactNode } from "react";

export function Label({ children, ...props }: PropsWithChildren<TextProps>) {
  return (
    <Text
      fontSize={props.fontSize ?? "sm"}
      fontWeight={props.fontWeight ?? "medium"}
      textOverflow={props.textOverflow ?? "ellipsis"}
      textWrap={props.textWrap ?? "nowrap"}
      whiteSpace={props.whiteSpace ?? "nowrap"}
      display={props.display ?? "inline-block"}
      overflow={props.overflow ?? "hidden"}
      {...props}
    >
      {children}
    </Text>
  );
}

interface IconLabelProps extends TextProps, PropsWithChildren {
  wrapperProps?: StackProps;
  icon: ReactNode;
}

export function IconLabel({
  children,
  wrapperProps,
  icon,
  ...props
}: IconLabelProps) {
  return (
    <HStack {...wrapperProps}>
      {icon}
      <Label {...props}>{children}</Label>
    </HStack>
  );
}
