"use client";

import { siteConfig } from "@/site_config";
import { footerHeight } from "@/styles";
import { Link, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import VersionText from "./version_text";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/login") {
    return null;
  }
  return (
    <Link
      position={"fixed"}
      bottom={0}
      h={footerHeight}
      href={siteConfig.links.github}
      target="_blank"
      title="GoDoxy Homepage"
      colorPalette={"teal"}
      w="full"
      justifyContent={"center"}
    >
      <Text>Powered by</Text>
      <Text color="fg.success">GoDoxy</Text>
      <VersionText />
    </Link>
  );
}