import { siteConfig } from "@/site_config";
import { For, Group, Link, Stack } from "@chakra-ui/react";
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

export default function Navbar() {
  return <DesktopNav />;
}

//TODO: implement mobile nav
// function MobileNav() {
//   return <DesktopNav />;
// }

function DesktopNav() {
  return (
    <Stack
      w="100vw"
      position={"static"}
      direction={"row"}
      justify={"space-between"}
      px={20}
      pt={4}
    >
      <div />
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
        <Link aria-label="Discord" href={siteConfig.links.discord}>
          <DiscordIcon className="text-default-500" />
        </Link>
        <Link aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <LogoutButton />
      </Group>
    </Stack>
  );
}
