"use client";

import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardBody } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { NextToastContainer } from "@/components/toast_container";
import Endpoints, { fetchEndpoint } from "@/types/endpoints";

export default function Dashboard() {
  const placeholderData = {
    proxies: {
      num_total_reverse_proxies: 0,
      num_total_streams: 0,
      providers: {
        "Loading...": {
          num_reverse_proxies: 0,
          num_streams: 0,
          type: "file",
        },
      },
    },
    uptime: "Loading...",
  };
  const [stats, setStats] = useState<typeof placeholderData>(placeholderData);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await fetchEndpoint(Endpoints.STATS);

      setStats(await stats.json());
    };

    const interval = setInterval(() => {
      fetchStats().catch(toast.error);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  function generatePalette(n: number): string[] {
    const palette: string[] = [];
    const saturation = 55; // Fixed saturation for vibrancy
    const lightness = 80; // Lower lightness for dark theme

    for (let i = 0; i < n; i++) {
      const hue = (i * 360) / n; // Spread hue evenly around the color wheel
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      palette.push(color);
    }

    return palette;
  }

  const palette = generatePalette(Object.keys(stats.proxies.providers).length);

  return (
    <div className="justify-center items-center flex">
      <NextToastContainer />
      <div className="gap-4 grid grid-cols-2">
        <Card className="xl:max-w-sm bg-primary rounded-xl shadow-md px-4">
          <CardBody className="py-5 overflow-hidden">
            <div className="flex flex-col">
              <span className="font-bold">Uptime</span>
            </div>
            <div className="flex gap-2.5 py-2 items-center">
              <span className="text-xl font-semibold">{stats.uptime}</span>
            </div>
          </CardBody>
        </Card>
        <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-4">
          <CardBody className="py-5">
            <div className="flex flex-col">
              <span className="font-bold">Running Services</span>
            </div>
            <div className="flex gap-6 py-2 items-center text-right">
              <div className="flex flex-col">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">
                  {stats.proxies.num_total_reverse_proxies +
                    stats.proxies.num_total_streams}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold">Reverse Proxies</span>
                <span className="text-xl font-semibold">
                  {stats.proxies.num_total_reverse_proxies}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold">Streams</span>
                <span className="text-xl font-semibold">
                  {stats.proxies.num_total_streams}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-4">
          <CardBody className="py-5">
            <div className="flex flex-col">
              <span className="font-bold">Providers</span>
              <span className="text-xs">
                {Object.keys(stats.proxies.providers).length} Providers
              </span>
            </div>
            <Spacer y={4} />
            <div className="gap-2 grid grid-cols-2 items-center text-right">
              {Object.entries(stats.proxies.providers).map(
                ([name, props], index) => (
                  <div
                    key={`provider_${name}`}
                    className="flex gap-2 items-center"
                  >
                    <FontAwesomeIcon
                      className="w-4"
                      color={
                        props.type == "docker" ? "#46ffff" : palette[index]
                      }
                      icon={props.type == "docker" ? faDocker : faFile}
                    />
                    <span className="text-small">{name}</span>
                  </div>
                ),
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
