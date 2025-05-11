import { Provider } from "@/components/ui/provider";
import "@/styles/globals.css";
import { Box, Link, Text, VStack } from "@chakra-ui/react";

import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/hooks/auth";
import { siteConfig } from "@/site_config";
import { bodyHeight, bodyPaddingX, footerHeight, navBarHeight } from "@/styles";
import dynamic from "next/dynamic";
import { Geist } from "next/font/google";
import { type ReactNode } from "react";

const geist = Geist({
  subsets: ["latin"],
});

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
      className={`${geist.className} antialiased`}
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
          <AuthProvider />
          <VStack w="100vw" h="100vh">
            <Navbar
              h={navBarHeight}
              position={"fixed"}
              top={0}
              pt="0"
              px="20"
            />
            <Box
              as="main"
              position={"fixed"}
              top={navBarHeight}
              px={bodyPaddingX}
              height={bodyHeight}
              width={"100%"}
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
        </Provider>
      </body>
    </html>
  );
}
