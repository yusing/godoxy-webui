import type { HomepageItem } from "@/lib/api";

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
    widget_config: null,
    url: "",
    origin_url: "",
    sort_order: 0,
  };
};

type HomepageItemsFilter = {
  category: string;
  provider: string;
};

export type { HomepageItemsFilter };
