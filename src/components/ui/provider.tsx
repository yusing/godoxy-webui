"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from "@chakra-ui/react";
import type { ThemeProviderProps } from "next-themes";
import { ColorModeProvider } from "./color-mode";

const system = defineConfig({
  globalCss: {
    body: {
      colorPalette: "teal",
    },
  },
  theme: {
    semanticTokens: {
      radii: {
        l1: { value: "0.125rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.375rem" },
      },
    },
  },
});

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={createSystem(mergeConfigs(defaultConfig, system))}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
