import { Icon } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "../ui/button";

export type ListboxItemProps = Readonly<{
  icon: ReactNode;
  text?: string;
  isSelected?: boolean;
}> &
  Omit<ButtonProps, "background">;

export function ListboxItem({
  icon,
  text,
  children,
  isSelected,
  ...rest
}: ListboxItemProps) {
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
}
