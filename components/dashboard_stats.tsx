import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardBody } from "@nextui-org/card";
import { Tooltip } from "@nextui-org/tooltip";
import { useTheme } from "next-themes";

import Stats from "../types/stats";

import { ProviderType } from "@/types/provider";
import { useLocalStorage } from "@uidotdev/usehooks";

export default function DashboardStats() {
  const { stats } = Stats();
  const { theme } = useTheme();
  const [showAllProviders, setShowAllProviders] = useLocalStorage(
    "dashboard_showAllProviders",
    false
  );

  function generatePalette(n: number): string[] {
    const palette: string[] = [];
    const saturation = 55; // Fixed saturation for vibrancy
    const lightness = theme === "light" ? 50 : 80;

    for (let i = 0; i < n; i++) {
      const hue = (i * 360) / n; // Spread hue evenly around the color wheel
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      palette.push(color);
    }

    return palette;
  }

  const palette = generatePalette(Object.keys(stats.proxies.providers).length);

  function providersGrid() {
    let providers = Object.entries(stats.proxies.providers);
    const nMore = providers.length - 5;
    const nMoreClass = nMore > 0 && !showAllProviders ? "" : "hidden";

    providers.sort((a, b) => b[1].num_streams - a[1].num_streams);
    if (!showAllProviders) {
      providers = providers.slice(0, 5);
    }

    return (
      <div
        className="gap-2 grid grid-cols-2 items-center text-left"
        onClick={() => setShowAllProviders(!showAllProviders)}
        tabIndex={0}
      >
        {providers.map(([name, props], index) => (
          <div key={`provider_${name}`} className="flex gap-2 items-center">
            <FontAwesomeIcon
              className="w-4"
              color={
                props.type == ProviderType.docker
                  ? theme === "dark"
                    ? "#46ffff"
                    : "#5491df"
                  : palette[index]
              }
              icon={props.type == ProviderType.docker ? faDocker : faFile}
            />

            <Tooltip
              content={
                <span className="text-medium">{`${props.num_reverse_proxies} reverse proxies, ${props.num_streams} streams`}</span>
              }
            >
              <span className="text-medium">
                {name.endsWith("!") ? name.slice(0, -1) : name}
              </span>
            </Tooltip>
          </div>
        ))}
        <div
          key={`provider_nmore`}
          className={`flex gap-2 items-center ${nMoreClass}`}
        >
          <FontAwesomeIcon className="w-4" icon={faEllipsis} />
          <span className="text-medium">{`and ${nMore} more`}</span>
        </div>
      </div>
    );
  }

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
            {providersGrid()}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
