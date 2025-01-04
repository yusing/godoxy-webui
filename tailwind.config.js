/** @type {import('tailwindcss').Config} */

import { nextui } from "@nextui-org/theme";

export default {
  content: [
    "./node_modules/@nextui-org/theme/dist/components/(button|card|image|input|kbd|link|listbox|modal|navbar|popover|scroll-shadow|spacer|spinner|toggle|table|tabs|ripple|form|divider|checkbox).js"
],
  content: {
    files: [
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
  },
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#BEF264",
              foreground: "#000000",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#002e62",
              foreground: "#000000",
            },
          },
        },
      },
    }),
  ],
};
