import { Card, CardBody } from "@nextui-org/card";

import Stats from "../types/stats";

import { ClientOnly } from "./client_only";
import ProvidersGrid from "./providers_grid";

export default function DashboardStats() {
  const { stats } = Stats();

  return (
    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 top-0 sticky">
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
          <div className="flex gap-6 py-2 items-start text-center">
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
            <ClientOnly>
              <ProvidersGrid stats={stats} />
            </ClientOnly>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
