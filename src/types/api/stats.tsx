"use client";

import type { RouteStats, StatsResponse } from "@/lib/api";

export const emptyRouteStats: RouteStats = {
  total: 0,
  healthy: 0,
  unhealthy: 0,
  napping: 0,
  error: 0,
  unknown: 0,
} as const;

export const skeletonStats: StatsResponse & { skeleton?: boolean } = {
  proxies: {
    total: 0,
    reverse_proxies: emptyRouteStats,
    streams: emptyRouteStats,
    providers: {
      a: {
        total: 0,
        reverse_proxies: emptyRouteStats,
        streams: emptyRouteStats,
        type: "file",
      },
      b: {
        total: 0,
        reverse_proxies: emptyRouteStats,
        streams: emptyRouteStats,
        type: "docker",
      },
      c: {
        total: 0,
        reverse_proxies: emptyRouteStats,
        streams: emptyRouteStats,
        type: "file",
      },
    },
  },
  uptime: "3 Days and 1 Hour",
  skeleton: true,
} as const;
