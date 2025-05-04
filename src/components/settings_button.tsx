import { IconButton } from "@chakra-ui/react";
import { ReactNode } from "react";
import { MdSettings } from "react-icons/md";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ButtonProps } from "./ui/button";

export function SettingsButton({
  title,
  children,
  iconProps,
}: Readonly<{
  title: string;
  children: ReactNode;
  iconProps?: ButtonProps;
}>) {
  return (
    <DialogRoot lazyMount unmountOnExit placement={"center"}>
      <DialogTrigger asChild>
        <IconButton variant={"ghost"} aria-label={title} {...iconProps}>
          <MdSettings />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontSize={"md"} fontWeight={"medium"}>
            {title}
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
