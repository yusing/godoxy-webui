import { ProviderType } from "@/types/provider";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@nextui-org/tooltip";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useTheme } from "next-themes";
import { Stats } from "../types/stats";

function generatePalette(theme: string | undefined, n: number): string[] {
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

export default function ProvidersGrid({ stats }: Readonly<{ stats: Stats }>) {
  const { theme } = useTheme();
  const [showAllProviders, setShowAllProviders] = useLocalStorage(
    "dashboard_showAllProviders",
    false
  );

  let providers = Object.entries(stats.proxies.providers);
  const nMore = providers.length - 5;
  const nMoreClass = nMore > 0 && !showAllProviders ? "" : "hidden";

  providers.sort((a, b) => b[1].num_streams - a[1].num_streams);
  if (!showAllProviders) {
    providers = providers.slice(0, 5);
  }

  const palette = generatePalette(
    theme,
    Object.keys(stats.proxies.providers).length
  );

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
