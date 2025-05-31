"use client";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import React from "react";
import { useColorMode } from "./ui/color-mode";

export const ThemeSwitch: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();
  const onChange = () => {
    colorMode === "light" ? setColorMode("dark") : setColorMode("light");
  };

  return colorMode === "light" ? (
    <SunFilledIcon size={22} onClick={onChange} />
  ) : (
    <MoonFilledIcon size={22} onClick={onChange} />
  );
};
