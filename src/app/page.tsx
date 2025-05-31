"use client";

import DashboardStats from "@/components/dashboard/dashboard_stats";
import { Toaster } from "@/components/ui/toaster";
import { bodyPaddingX } from "@/styles";
import { Box, Stack } from "@chakra-ui/react";
import { useWindowSize } from "@uidotdev/usehooks";
import dynamic from "next/dynamic";

const AppGroups = dynamic(() => import("@/components/dashboard/app_groups"), {
  ssr: false,
});

export default function HomePage() {
  const windowSize = useWindowSize();
  const isMobile = (windowSize.width ?? Infinity) < 600;

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      align={"flex-start"}
      justifyContent={"center"}
      wrap={isMobile ? "wrap" : "nowrap"}
      gap={bodyPaddingX}
      w="full"
    >
      <Toaster />
      <Box position={isMobile ? "" : "sticky"} top={isMobile ? "" : "0"}>
        <DashboardStats isMobile={isMobile} />
      </Box>
      <AppGroups isMobile={isMobile} />
    </Stack>
  );
}
