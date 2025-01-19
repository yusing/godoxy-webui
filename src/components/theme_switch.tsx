"use client";

import { useTheme } from "next-themes";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import React from "react";

export const ThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return theme === "light" ? (
    <SunFilledIcon size={22} onClick={onChange} />
  ) : (
    <MoonFilledIcon size={22} onClick={onChange} />
  );
};
