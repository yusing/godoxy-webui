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
            <p className="font-bold">Uptime</p>
          </div>
          <div className="flex gap-2.5 py-2 items-center">
            <p className="text-xl font-semibold">{stats.uptime}</p>
          </div>
        </CardBody>
      </Card>
      <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-4">
        <CardBody className="py-5 overflow-hidden">
          <div className="flex flex-col">
            <p className="font-bold">Running Services</p>
          </div>
          <div className="flex gap-6 py-2 items-start text-center">
            <div className="flex flex-col">
              <p className="text-xl font-semibold">Total</p>
              <p className="text-xl font-semibold">
                {stats.proxies.num_total_reverse_proxies +
                  stats.proxies.num_total_streams}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-semibold">Reverse Proxies</p>
              <p className="text-xl font-semibold">
                {stats.proxies.num_total_reverse_proxies}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-semibold">Streams</p>
              <p className="text-xl font-semibold">
                {stats.proxies.num_total_streams}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-4">
        <CardBody className="py-5">
          <div className="flex flex-col">
            <p className="font-bold">Providers</p>
            <ClientOnly>
              <ProvidersGrid stats={stats} />
            </ClientOnly>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
