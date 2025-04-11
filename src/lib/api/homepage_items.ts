import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import type {
  HomepageItem,
  HomepageItems,
  HomepageItemsFilter,
} from "@/types/api/route/homepage_item";

export function MarshalItem(item: HomepageItem) {
  return JSON.stringify({
    name: item.name,
    icon: item.icon,
    category: item.category,
    description: item.description,
    widget_config: item.widget_config,
  });
}

export async function getHomepageItems({
  category,
  provider,
}: HomepageItemsFilter): Promise<HomepageItems> {
  const currentHost = window.location.host.split(".").slice(1).join(".");

  try {
    const response = await fetchEndpoint(Endpoints.HOMEPAGE_CFG, {
      query: {
        category,
        provider,
      },
    });
    if (response === null) {
      return {};
    }
    const data = (await response.json()) as HomepageItems;
    // sort by length of name and then alphabetically
    for (const category of Object.values(data)) {
      category.sort((a: HomepageItem, b: HomepageItem) => {
        return a.name.length - b.name.length || a.name.localeCompare(b.name);
      });
      for (const item of category) {
        try {
          new URL(item.url);
        } catch {
          item.url = "";
        }
        // if an override url is not set, use the default
        if (!item.url) {
          let fqdn: string;
          if (item.alias.includes(".")) {
            fqdn = item.alias;
          } else {
            fqdn = `${item.alias}.${currentHost}`;
          }
          item.url = `${window.location.protocol}//${fqdn}/`;
        }
      }
    }

    return data;
  } catch (error) {
    toastError(error);
    return {};
  }
}

export function getHiddenHomepageItems(items: HomepageItems): HomepageItem[] {
  return Object.entries(items).flatMap(([_, items]) =>
    items.filter((item) => !item.show),
  );
}
