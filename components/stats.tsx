import log from "loglevel";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Endpoints, { ws } from "@/types/endpoints";
import { ProviderType } from "@/types/provider";

export default function Stats() {
  const [stats, setStats] = useState({
    proxies: {
      num_total_reverse_proxies: 0,
      num_total_streams: 0,
      providers: {
        "Loading...": {
          num_reverse_proxies: 0,
          num_streams: 0,
          type: ProviderType.file,
        },
      },
    },
    uptime: "Loading...",
  });

  useEffect(() => {
    const socket = ws(Endpoints.STATS);

    socket.onopen = () => {
      log.debug("stats ws opened");
    };

    socket.onmessage = (event) => {
      // log.debug("stats ws message", event);
      setStats(JSON.parse(event.data.toString()));
    };

    socket.onerror = (event) => {
      toast.error(`Failed to fetch stats:`);
      log.error(event);
    };

    socket.onclose = (event) => {
      log.debug("stats ws closed", event);
    };
  }, []);

  return { stats };
}
