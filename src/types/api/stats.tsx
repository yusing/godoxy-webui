import log from "loglevel";
import { useEffect, useState } from "react";

import { toaster } from "@/components/ui/toaster";
import Endpoints, { ws } from "@/types/api/endpoints";
import { ProviderType } from "@/types/api/provider";

export type RouteStats = {
  total: number;
  healthy: number;
  unhealthy: number;
  napping: number;
  error: number;
  unknown: number;
  skeleton?: boolean;
};

export type ProviderStats = {
  total: number;
  reverse_proxies: RouteStats;
  streams: RouteStats;
  type: ProviderType;
  skeleton?: boolean;
};

export type Stats = {
  proxies: {
    total: number;
    reverse_proxies: RouteStats;
    streams: RouteStats;
    providers: Record<string, ProviderStats>;
  };
  uptime: string;
  skeleton?: boolean;
};

function emptyRouteStats(): RouteStats {
  return {
    total: 0,
    healthy: 0,
    unhealthy: 0,
    napping: 0,
    error: 0,
    unknown: 0,
    skeleton: true,
  };
}

export default function useStats() {
  const [stats, setStats] = useState<Stats>({
    proxies: {
      total: 0,
      reverse_proxies: emptyRouteStats(),
      streams: emptyRouteStats(),
      providers: {
        a: {
          total: 0,
          reverse_proxies: emptyRouteStats(),
          streams: emptyRouteStats(),
          type: ProviderType.file,
          skeleton: true,
        },
        b: {
          total: 0,
          reverse_proxies: emptyRouteStats(),
          streams: emptyRouteStats(),
          type: ProviderType.docker,
          skeleton: true,
        },
        c: {
          total: 0,
          reverse_proxies: emptyRouteStats(),
          streams: emptyRouteStats(),
          type: ProviderType.file,
          skeleton: true,
        },
      },
    },
    uptime: "3 Days and 1 Hour",
    skeleton: true,
  });

  useEffect(() => {
    const socket = ws(Endpoints.STATS);
    socket.onmessage = (event) => {
      setStats(JSON.parse(event.data as string));
    };
    socket.onerror = (event) => {
      toaster.error(event);
      log.error(event);
    };
    return () => {
      socket.close();
    };
  }, []);

  return stats;
}
