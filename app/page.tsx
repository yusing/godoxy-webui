"use client";

import AppGroups from "@/components/app_groups";
import DashboardStats from "@/components/dashboard_stats";
import { NextToastContainer } from "@/components/toast_container";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <NextToastContainer />
      <DashboardStats />
      <AppGroups />
    </div>
  );
}
