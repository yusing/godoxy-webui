"use client";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import { useCallback } from "react";
import { useColorMode } from "./ui/color-mode";

export function ThemeSwitch() {
  const { colorMode, setColorMode } = useColorMode();
  const onChange = useCallback(
    () =>
      colorMode === "light" ? setColorMode("dark") : setColorMode("light"),
    [colorMode, setColorMode],
  );

  return colorMode === "light" ? (
    <SunFilledIcon size={22} onClick={onChange} />
  ) : (
    <MoonFilledIcon size={22} onClick={onChange} />
  );
}
