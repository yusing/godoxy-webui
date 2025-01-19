import { MenuContent, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { Box, Heading, IconButton } from "@chakra-ui/react";
import React from "react";
import { MdSettings } from "react-icons/md";

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
    <MenuRoot {...props}>
      <MenuTrigger asChild>
        <IconButton aria-label={title} {...iconProps}>
          <MdSettings />
        </IconButton>
      </MenuTrigger>
      <MenuContent minW={"250px"}>
        <Box p={4} gap={1}>
          <Heading as="h3" size="sm" fontWeight={"medium"}>
            {title}
          </Heading>
          <Box mt={4}>{children}</Box>
        </Box>
      </MenuContent>
    </MenuRoot>
  );
}
