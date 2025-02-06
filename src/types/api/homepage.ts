import Endpoints, { fetchEndpoint } from "./endpoints";
import { HomepageItem } from "./route/homepage_item";

type OverrideHomepageParams = {
  item: {
    which: HomepageItem["alias"];
    value: HomepageItem;
  };
  items_batch: {
    which?: null;
    value: Record<HomepageItem["alias"], HomepageItem>;
  };
  category_order: {
    which?: null;
    value: number;
  };
  item_visible: {
    which: HomepageItem["alias"][];
    value: boolean;
  };
};

export function overrideHomepage<T extends keyof OverrideHomepageParams>(
  what: T,
  which: OverrideHomepageParams[T]["which"],
  value: OverrideHomepageParams[T]["value"],
) {
  return fetchEndpoint(Endpoints.SET_HOMEPAGE, {
    method: "POST",
    query: { what },
    body: JSON.stringify({ which, value }),
    headers: { "Content-Type": "application/json" },
  });
}

type IconProvider = "selfhst" | "walkxcode";
type IconFormat = "svg" | "png" | "webp";
export type Icon = `${IconProvider}/${string}.${IconFormat}`;
