import { Provider } from "@/components/ui/provider";
import "@/styles/globals.css";
import { Box, VStack } from "@chakra-ui/react";

import Footer from "@/components/footer";
import { AuthProvider } from "@/hooks/auth";
import { siteConfig } from "@/site_config";
import { bodyHeight, bodyPaddingX, navBarHeight } from "@/styles";
import dynamic from "next/dynamic";
import { Geist } from "next/font/google";
import { type ReactNode } from "react";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = siteConfig.metadata;

const Navbar = dynamic(() => import("@/components/navbar"), {
  loading: () => null,
});

export default function RootLayout(props: Readonly<{ children: ReactNode }>) {
  const { children } = props;
  return (
    <html suppressHydrationWarning lang="en" className={geist.className}>
      {process.env.NODE_ENV === "development" && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
        </head>
      )}
      <body suppressHydrationWarning>
        <Provider
          defaultTheme="dark"
          enableSystem
          enableColorScheme
          storageKey={"__theme"}
          attribute={["class", "data-theme", "data-color-mode"]}
        >
          <AuthProvider />
          <VStack w="100vw" h="100vh">
            <Navbar h={navBarHeight} position={"fixed"} top={0} />
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
            <Footer />
          </VStack>
        </Provider>
      </body>
    </html>
  );
}
