import Endpoints, { fetchEndpoint } from "./endpoints";

type OverrideHomepageKey =
  | "item"
  | "category_order"
  | "category_name"
  | "item_visible";

export function overrideHomepage(
  what: OverrideHomepageKey,
  which: string,
  value: string | number,
) {
  return fetchEndpoint(Endpoints.SET_HOMEPAGE, {
    method: "POST",
    query: {
      what,
      which,
      value,
    },
  });
}

type IconProvider = "selfhst" | "walkxcode";
type IconFormat = "svg" | "png" | "webp";
export type Icon = `${IconProvider}/${string}.${IconFormat}`;
