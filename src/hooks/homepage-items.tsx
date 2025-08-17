import { useAllSettings } from "@/components/dashboard/settings";
import type { HomepageItems } from "@/lib/api";
import { api, callApi } from "@/lib/api-client";
import { toastError } from "@/lib/toast";
import { DummyHomepageItem } from "@/types/api/homepage_item";

import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useLocalStorage } from "react-use";

export function useHomepageItems(): [
  HomepageItems,
  Dispatch<SetStateAction<HomepageItems | undefined>>,
] {
  const { categoryFilter, providerFilter } = useAllSettings();

  const [localValue, setLocalValue] = useLocalStorage<HomepageItems>(
    "homepage_items",
    dummyItems(),
  );

  useEffect(() => {
    callApi(api.homepage.items, {
      category: categoryFilter.val,
      provider: providerFilter.val,
    }).then(({ data, error }) => {
      if (error) {
        toastError(error);
        setLocalValue(dummyItems());
      }
      setLocalValue(data ?? dummyItems());
    });
  }, [categoryFilter.val, providerFilter.val]);

  return [localValue!, setLocalValue];
}

function dummyItems(): HomepageItems {
  const items = [];
  for (let i = 0; i < 15; i++) {
    items.push(DummyHomepageItem());
  }
  return { Docker: items, Others: items };
}
