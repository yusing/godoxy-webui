"use client";

import AppGroups from "@/components/dashboard/app_groups";
import DashboardStats from "@/components/dashboard/dashboard_stats";
import { Toaster } from "@/components/ui/toaster";
import { Box, ClientOnly, HStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

//TODO: change app and category name with context menu
export default function HomePage() {
  const hStackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWrap = () => {
      if (hStackRef.current) {
        const isMobile = hStackRef.current.clientWidth < 600;
        setIsMobile(isMobile);
      }
    };

    window.addEventListener("load", checkWrap);
    window.addEventListener("resize", checkWrap);
    return () => window.removeEventListener("resize", checkWrap);
  }, []);

  return (
    <HStack
      ref={hStackRef}
      gap="16"
      align={"flex-start"}
      justifyContent={isMobile ? "center" : "unset"}
      wrap={isMobile ? "wrap" : "nowrap"}
      px={"8"}
    >
      <Toaster />

      <Box position={isMobile ? "" : "sticky"} top={isMobile ? "" : "14"}>
        <DashboardStats isMobile={isMobile} />
      </Box>
      <ClientOnly>
        <AppGroups isMobile={isMobile} />
      </ClientOnly>
    </HStack>
  );
}
