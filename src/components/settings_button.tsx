import { IconButton } from "@chakra-ui/react";
import React from "react";
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

export function SettingsButton({
  title,
  children,
  iconProps,
  ...props
}: Readonly<{
  title: string;
  children: React.ReactNode;
  iconProps?: React.ComponentProps<typeof IconButton>;
  [key: string]: any;
}>): React.JSX.Element {
  return (
    <DialogRoot {...props} lazyMount unmountOnExit placement={"top"}>
      <DialogTrigger asChild>
        <IconButton aria-label={title} {...iconProps}>
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
