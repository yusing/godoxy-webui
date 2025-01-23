import Endpoints, { fetchEndpoint, toastError } from "../endpoints";
import { ProviderType } from "../provider";

export type HomepageItem = {
  show: boolean;
  name: string;
  icon: string;
  category: string;
  description: string;
  widget_config?: {};
} & HomepageItemMetadata;

type HomepageItemMetadata = {
  alias: string;
  provider: string;
  url: string;
  alt_url: string;
  source_type: ProviderType;
  skeleton?: boolean;
};

export function MarshalItem(item: HomepageItem) {
  return JSON.stringify({
    name: item.name,
    icon: item.icon,
    category: item.category,
    description: item.description,
    widget_config: item.widget_config,
  });
}

const randName = (length: number) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const DummyHomepageItem = (): HomepageItem => {
  return {
    show: true,
    name: randName(10),
    alias: randName(10),
    provider: randName(10),
    icon: "",
    category: randName(10),
    description: "",
    widget_config: {},
    url: "",
    alt_url: "",
    source_type: ProviderType.file,
    skeleton: true,
  };
};

export type HomepageItems = Record<string, HomepageItem[]>;

type HomepageItemsFilter = {
  category: string;
  provider: string;
};

export async function getHomepageItems({
  category,
  provider,
}: HomepageItemsFilter): Promise<HomepageItems> {
  const currentHostname = window.location.hostname
    .split(".")
    .slice(1)
    .join(".");

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
    toastError(error);
    return {};
  }
}

export function getHiddenHomepageItems(items: HomepageItems): HomepageItem[] {
  return Object.entries(items).flatMap(([_, items]) =>
    items.filter((item) => !item.show),
  );
}
