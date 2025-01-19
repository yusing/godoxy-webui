"use client";

import { Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

export default function NavItemText({
  href,
  text,
}: Readonly<{ href: string; text: string }>) {
  const pathname = usePathname();
  if (pathname === href) {
    return <Text color="fg.success">{text}</Text>;
  }
  return <Text>{text}</Text>;
}
