import { Provider } from "@/components/ui/provider";
import "@/styles/globals.css";
import { Box, ClientOnly, Link, Text, VStack } from "@chakra-ui/react";

import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/hooks/auth";
import { siteConfig } from "@/site_config";
import {
  bodyHeight,
  bodyPaddingX,
  bodyWidth,
  footerHeight,
  navBarHeight,
} from "@/styles";
import { GeistSans } from "geist/font/sans";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";

export const metadata = siteConfig.metadata;

const VersionText = dynamic(() => import("@/components/version_text"), {
  loading: () => <Skeleton w="30px"></Skeleton>,
});

export default function RootLayout(props: Readonly<{ children: ReactNode }>) {
  const { children } = props;
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${GeistSans.variable} antialiased`}
    >
      {process.env.NODE_ENV === "development" && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
        </head>
      )}
      <body>
        <Provider
          defaultTheme="dark"
          enableSystem
          storageKey={"__theme"}
          attribute={["class", "data-theme", "data-color-mode"]}
        >
          <AuthProvider>
            <VStack w="100vw" h="100vh">
              <ClientOnly>
                <Navbar
                  h={navBarHeight}
                  position={"fixed"}
                  top={0}
                  pt="0"
                  px="20"
                />
              </ClientOnly>
              <Box
                as="main"
                position={"fixed"}
                top={navBarHeight}
                mx={bodyPaddingX}
                height={bodyHeight}
                width={bodyWidth}
                overflowY={"auto"}
                scrollBehavior={"smooth"}
                scrollbar={"auto"}
              >
                {children}
              </Box>
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
            </VStack>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
