import log from "loglevel";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Endpoints, { ws } from "@/types/endpoints";
import { ProviderType } from "@/types/provider";

export type Stats = {
  proxies: {
    num_total_reverse_proxies: number;
    num_total_streams: number;
    providers: {
      [key: string]: {
        num_reverse_proxies: number;
        num_streams: number;
        type: ProviderType;
      };
    };
  };
  uptime: string;
};

export default function Stats() {
  const [stats, setStats] = useState<Stats>({
    proxies: {
      num_total_reverse_proxies: 0,
      num_total_streams: 0,
      providers: {},
    },
    uptime: "Loading...",
  });

  useEffect(() => {
    const socket = ws(Endpoints.STATS);

    socket.onopen = () => {
      log.debug("stats ws opened");
    };

    socket.onmessage = (event) => {
      setStats(JSON.parse(event.data.toString()));
    };

    socket.onerror = (event) => {
      toast.error(`Failed to fetch stats: ${event}`);
      log.error(event);
    };

    socket.onclose = (event) => {
      log.debug("stats ws closed", event);
    };
  }, []);

  return { stats };
}
