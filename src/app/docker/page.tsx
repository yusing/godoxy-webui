"use client";

import { ContainerProvider } from "@/components/docker/container_context";
import { DockerLogs } from "@/components/docker/docker_logs";
import "@/styles/logs.css";

export default function Page() {
  return (
    <ContainerProvider>
      <DockerLogs />
    </ContainerProvider>
  );
}
