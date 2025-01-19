import Navbar from "@/components/navbar";
import { Provider } from "@/components/ui/provider";
import "@/styles/globals.css";
import { Box, Link, Text, VStack } from "@chakra-ui/react";

import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/site_config";
import { GeistSans } from "geist/font/sans";
import dynamic from "next/dynamic";

export const metadata = siteConfig.metadata;

const VersionText = dynamic(() => import("@/components/version_text"), {
  loading: () => <Skeleton w="30px"></Skeleton>,
});

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const { children } = props;
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${GeistSans.variable}`}
    >
      <head />
      <body>
        <Provider
          defaultTheme="dark"
          enableSystem
          attribute={["class", "data-theme"]}
        >
          <VStack
            px={{
              sm: "4",
              md: "6",
              lg: "8",
            }}
          >
            <Navbar />
            <Box pt="16px" as="main">
              {children}
            </Box>
            <Link
              as={"footer"}
              href="https://github.com/yusing/go-proxy"
              title="GoDoxy Homepage"
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
