import { Card, CardBody } from "@nextui-org/card";
import { Tooltip } from "@nextui-org/tooltip";

import FavIcon from "./favico";

import { HomepageItem } from "@/types/homepage_item";

type AppCardProps = {
  style?: React.CSSProperties;
  item: HomepageItem;
};

export default function AppCard({ item, style }: AppCardProps) {
  return (
    <a
      key={item.name}
      className="p-2 transition-transform transform hover:scale-105"
      href={item.url}
      rel="noopener noreferrer"
      style={style}
      target="_blank"
    >
      <Tooltip content={item.url}>
        <Card className="p-2" shadow="none">
          <CardBody>
            <div className="flex items-center space-x-2">
              {<FavIcon alt={item.name} base={item.url} href={item.icon} />}
              <div className="flex flex-col">
                <span className="font-medium text-medium">{item.name}</span>
                {item.description && (
                  <span className="text-sm text-gray-600">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </Tooltip>
    </a>
  );
}
