"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  defineLayerStyles,
} from "@chakra-ui/react";
import type { ThemeProviderProps } from "next-themes";
import { ColorModeProvider } from "./color-mode";

const layerStyles = defineLayerStyles({
  container: {
    description: "container layer style",
    value: {
      bg: "bg.muted",
    },
  },
});

const config = defineConfig({
  theme: {
    layerStyles,
  },
});

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={createSystem(defaultConfig, config)}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
