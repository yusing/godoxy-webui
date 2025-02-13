import { ProviderType } from "../route_provider";

type HomepageItem = {
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

type HomepageItems = Record<string, HomepageItem[]>;

type HomepageItemsFilter = {
  category: string;
  provider: string;
};

export type { HomepageItem, HomepageItems, HomepageItemsFilter };
