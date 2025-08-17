import { HealthMapContext } from "@/hooks/health_map";
import { useWebSocketApi } from "@/hooks/websocket";
import type { HealthMap } from "@/lib/api";
import { type ReactNode, useState } from "react";

export default function HealthProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<HealthMap>({});
  // useWSJSON should handle the single connection internally
  useWebSocketApi<HealthMap>({
    endpoint: "/health",
    onMessage: (data) => setHealth(data),
  });

  return (
    <HealthMapContext.Provider value={health}>
      {children}
    </HealthMapContext.Provider>
  );
}
