import { HStack, StackProps, Text, TextProps } from "@chakra-ui/react";
import { FC, PropsWithChildren, ReactNode } from "react";

export const Label: FC<PropsWithChildren<TextProps>> = ({
  children,
  ...props
}) => {
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
};

interface IconLabelProps extends TextProps, PropsWithChildren {
  wrapperProps?: StackProps;
  icon: ReactNode;
}

export const IconLabel: FC<IconLabelProps> = ({
  children,
  wrapperProps,
  icon,
  ...props
}) => {
  return (
    <HStack {...wrapperProps}>
      {icon}
      <Label {...props}>{children}</Label>
    </HStack>
  );
};
