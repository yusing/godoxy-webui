"use client";

import { siteConfig } from "@/site_config";
import { Box, For, Group, Link, Stack, StackProps } from "@chakra-ui/react";
import React from "react";
import useCheckAuth from "./auth";
import { DiscordIcon, GithubIcon } from "./icons";
import LogoutButton from "./logout_button";
import NavItemText from "./navItem_text";
import { ThemeSwitch } from "./theme_switch";

export const HrefLabelMapping = siteConfig.navItems.reduce(
  (acc, navItem) => {
    acc[navItem.href] = navItem.label;
    return acc;
  },
  {} as Record<string, string>,
);

const Navbar: React.FC<StackProps> = (props) => {
  const authed = useCheckAuth();
  if (!authed) {
    return null;
  }
  return <DesktopNav {...props} />;
};

export default Navbar;

//TODO: implement mobile nav
// function MobileNav() {
//   return <DesktopNav />;
// }

const DesktopNav: React.FC<StackProps> = (props) => {
  return (
    <Stack {...props} w="100vw" direction={"row"} justify={"space-between"}>
      <Box />
      <Group>
        <For each={siteConfig.navItems}>
          {(navItem) => (
            <Link
              p="2"
              key={navItem.label}
              href={navItem.href}
              fontSize={"md"}
              fontWeight={"medium"}
            >
              <NavItemText href={navItem.href} text={navItem.label} />
            </Link>
          )}
        </For>
      </Group>
      <Group gap={4}>
        <Link
          aria-label="Discord"
          target="_blank"
          href={siteConfig.links.discord}
        >
          <DiscordIcon className="text-default-500" />
        </Link>
        <Link
          aria-label="Github"
          target="_blank"
          href={siteConfig.links.github}
        >
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <LogoutButton />
      </Group>
    </Stack>
  );
};
