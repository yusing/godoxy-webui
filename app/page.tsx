"use client";

import AppGroups from "@/components/app_groups";
import DashboardStats from "@/components/dashboard_stats";
import { NextToastContainer } from "@/components/toast_container";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <NextToastContainer />
      <div className="sticky top-[50px]">
        <DashboardStats />
      </div>
      <AppGroups />
    </div>
  );
}
