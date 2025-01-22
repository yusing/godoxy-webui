"use client";

import AppGroups from "@/components/dashboard/app_groups";
import DashboardStats from "@/components/dashboard/dashboard_stats";
import { Toaster } from "@/components/ui/toaster";
import { Box, ClientOnly, Stack } from "@chakra-ui/react";
import { useWindowSize } from "@uidotdev/usehooks";

//TODO: change app and category name with context menu
export default function HomePage() {
  const windowSize = useWindowSize();
  const isMobile = (windowSize.width ?? Infinity) < 600;

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      gap="16"
      align={"flex-start"}
      justifyContent={isMobile ? "center" : "unset"}
      wrap={isMobile ? "wrap" : "nowrap"}
    >
      <Toaster />

      <Box position={isMobile ? "" : "sticky"}>
        <DashboardStats isMobile={isMobile} />
      </Box>
      <ClientOnly>
        <AppGroups isMobile={isMobile} />
      </ClientOnly>
    </Stack>
  );
}
