import { HStack, StackProps, Text, TextProps } from "@chakra-ui/react";
import { FC, PropsWithChildren, ReactNode } from "react";

export const Label: FC<PropsWithChildren<TextProps>> = ({
  children,
  ...props
}) => {
  return (
    <Text
      fontSize={"sm"}
      fontWeight={"medium"}
      textOverflow={"ellipsis"}
      textWrap={"nowrap"}
      whiteSpace={"nowrap"}
      display={"inline-block"}
      overflow={"hidden"}
      {...props}
    >
      {children}
    </Text>
  );
};

export const IconLabel: FC<
  PropsWithChildren & TextProps & { wrapperProps?: StackProps; icon: ReactNode }
> = ({ children, wrapperProps, icon, ...props }) => {
  return (
    <HStack {...wrapperProps}>
      {icon}
      <Label {...props}>{children}</Label>
    </HStack>
  );
};
