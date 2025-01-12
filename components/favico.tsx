import { Image } from "@nextui-org/image";

import Endpoints from "@/types/endpoints";
import { HomepageItem } from "@/types/homepage_item";

export default function FavIcon({ item }: Readonly<{ item: HomepageItem }>) {
  return (
    <Image
      alt={item.name}
      height={24}
      width={24}
      src={Endpoints.FavIcon(item.alias)}
      fallbackSrc={<span className="text-default-400 text-lg">⚠️</span>}
    />
  );
}
