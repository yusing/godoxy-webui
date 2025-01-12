import { toast } from "react-toastify";

import Endpoints, { fetchEndpoint } from "./endpoints";
import { ProviderType } from "./provider";

export type HomepageItem = {
  name: string;
  alias: string;
  icon?: {
    value: string;
    is_relative: boolean;
  };
  category: string;
  description: string;
  widget_config: Record<string, any>;

  url: string;
  alt_url: string;
  source_type: ProviderType;
};

export type HomepageItems = Record<string, HomepageItem[]>;

export async function getHomepageItems() {
  const currentHostname = window.location.hostname
    .split(".")
    .slice(1)
    .join(".");
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
        // if an override url is not set, use the default
        if (item.url == "") {
          let fqdn: string;
          if (item.alias.includes(".")) {
            fqdn = item.alias;
          } else {
            fqdn = `${item.alias}.${currentHostname}`;
          }
          item.url = `${window.location.protocol}//${fqdn}/`;
        }
      }
    }

    return data;
  } catch (error) {
    toast.error(`${error}`);

    return {};
  }
}
