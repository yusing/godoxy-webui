import { Icon } from "@chakra-ui/react";
import React from "react";
import { Button, ButtonProps } from "../ui/button";

export type ListboxItemProps = Readonly<{
  icon: React.ReactNode;
  text?: string;
  isSelected?: boolean;
}> &
  Omit<ButtonProps, "background">;

export const ListboxItem: React.FC<ListboxItemProps> = ({
  icon,
  text,
  children,
  isSelected,
  ...rest
}) => {
  return (
    <Button
      justifyContent={"left"}
      size={rest.size ?? "sm"}
      variant={rest.variant ?? "ghost"}
      fontSize={rest.fontSize ?? "sm"}
      color={isSelected ? "fg.info" : rest.color}
      p={(rest.p || rest.padding) ?? 0}
      bg={rest.bg}
      {...rest}
    >
      <Icon color={"inherit"}>{icon}</Icon>
      {text}
      {children}
    </Button>
  );
};
