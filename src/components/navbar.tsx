"use client";

import { siteConfig } from "@/site_config";
import {
  Box,
  ClientOnly,
  Flex,
  FlexProps,
  For,
  Group,
  Link,
  Stack,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { FaDocker } from "react-icons/fa6";
import {
  LuBookOpen,
  LuChartArea,
  LuFileCode,
  LuHouse,
  LuServer,
  LuSettings,
} from "react-icons/lu";
import { DiscordIcon, GithubIcon } from "./icons";
import LogoutButton from "./logout_button";
import { ThemeSwitch } from "./theme_switch";
import { useColorMode } from "./ui/color-mode";

type NavLabel = (typeof siteConfig.navItems)[number]["label"];

// Mapping icons from string to actual components
const iconComponents: Record<NavLabel, React.ElementType> = {
  Dashboard: LuHouse,
  "Config Editor": LuSettings,
  "Compose Editor": LuFileCode,
  Proxies: LuServer,
  Metrics: LuChartArea,
  Docker: FaDocker,
  Wiki: LuBookOpen,
} as const;

const colors = {
  light: {
    linkColor: "gray.600",
    linkHoverColor: "blue.500",
    activeLinkColor: "teal.500",
    activeLinkBorderColor: "teal.500",
    iconColor: "gray.500",
    iconHoverColor: "teal.500",
    navBg: "gray.100",
  },
  dark: {
    linkColor: "gray.300",
    linkHoverColor: "blue.300",
    activeLinkColor: "teal.300",
    activeLinkBorderColor: "teal.300",
    iconColor: "gray.400",
    iconHoverColor: "teal.300",
    navBg: "gray.900",
  },
} as const;

function Navbar(props: FlexProps) {
  if (usePathname() == "/login") {
    return null;
  }
  return (
    <ClientOnly>
      <DesktopNav {...props} />
    </ClientOnly>
  );
}

export default Navbar;

//TODO: implement mobile nav
// function MobileNav() {
//   return <DesktopNav />;
// }

const DesktopNav: React.FC<FlexProps> = (props) => {
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const {
    linkColor,
    linkHoverColor,
    activeLinkColor,
    activeLinkBorderColor,
    iconColor,
    iconHoverColor,
    navBg,
  } = useMemo(() => colors[colorMode]!, [colorMode]);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      px={10}
      py={3}
      bg={navBg}
      color="gray.200"
      {...props}
    >
      <Group gap={{ base: 1, md: 3 }}>
        <For each={siteConfig.navItems}>
          {(navItem) => {
            const IconComponent = iconComponents[navItem.label]!;
            const isActive = pathname === navItem.href;
            return (
              <Stack gap={0} key={navItem.label}>
                <Link
                  href={navItem.href}
                  fontSize="sm"
                  fontWeight="medium"
                  color={isActive ? activeLinkColor : linkColor}
                  _hover={{
                    textDecoration: "none",
                    color: linkHoverColor,
                  }}
                  p={2}
                  display="flex"
                  alignItems="center"
                  transition="color 0.2s, border-color 0.2s"
                >
                  <IconComponent size={20} color={iconColor} />
                  {navItem.label}
                </Link>
                <Box
                  h={isActive ? "2px" : "0"}
                  w="full"
                  bg={activeLinkBorderColor}
                />
              </Stack>
            );
          }}
        </For>
      </Group>

      <Group align="center" gap={{ base: 2, md: 4 }}>
        <Link
          aria-label="Discord"
          target="_blank"
          href={siteConfig.links.discord}
          color={iconColor}
          _hover={{ color: iconHoverColor }}
          display="flex"
          alignItems="center"
        >
          <DiscordIcon size={20} />
        </Link>
        <Link
          aria-label="Github"
          target="_blank"
          href={siteConfig.links.github}
          color={iconColor}
          _hover={{ color: iconHoverColor }}
          display="flex"
          alignItems="center"
        >
          <GithubIcon size={20} />
        </Link>
        <ThemeSwitch />
        <LogoutButton />
      </Group>
    </Flex>
  );
};
