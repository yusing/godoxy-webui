import { Tooltip } from "@nextui-org/tooltip";

import FavIcon from "./favico";

import { HomepageItem } from "@/types/homepage_item";

type AppCardProps = {
  style?: React.CSSProperties;
  item: HomepageItem;
};

export default function AppCard({ item, style }: Readonly<AppCardProps>) {
  return (
    <a
      className="transition-transform transform hover:scale-105"
      href={item.url}
      rel="noopener noreferrer"
      style={style}
      target="_blank"
    >
      <Tooltip content={item.url}>
        <div className="flex items-center gap-x-3 p-5">
          {<FavIcon item={item} />}
          <div className="flex flex-col">
            <p className="font-medium text-medium">{item.name}</p>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
          </div>
        </div>
      </Tooltip>
    </a>
  );
}
