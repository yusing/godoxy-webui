import { Text, TextProps } from "@chakra-ui/react";
import { FC, PropsWithChildren } from "react";

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
      {...props}
    >
      {children}
    </Text>
  );
};
