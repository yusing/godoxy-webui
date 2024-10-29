import { toast } from "react-toastify";

import Endpoints, { fetchEndpoint } from "./endpoints";
import { ProviderType } from "./provider";

export type HomepageItem = {
  name: string;
  icon: string;
  category: string;
  description: string;
  widget_config: Record<string, any>;

  url: string;
  alt_url: string;
  source_type: ProviderType;
};

export type HomepageItems = Record<string, HomepageItem[]>;

export async function getHomepageItems() {
  const response = await fetchEndpoint(Endpoints.HOMEPAGE_CFG);

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage items: ${response.statusText}`);
  }

  try {
    const data = (await response.json()) as HomepageItems;

    // sort by length of name and then alphabetically
    for (const category of Object.values(data)) {
      category.sort((a: HomepageItem, b: HomepageItem) => {
        return a.name.length - b.name.length || a.name.localeCompare(b.name);
      });
      for (const item of category) {
        if (item.url.startsWith("https://")) {
          item.url = item.url.replace(":443", "");
        } else if (item.url.startsWith("http://")) {
          item.url = item.url.replace(":80", "");
        }
      }
    }

    return data;
  } catch (error) {
    toast.error(`${error}`);

    return {};
  }
}
