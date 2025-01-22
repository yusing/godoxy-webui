"use client";

import {
  DummyHomepageItem,
  getHomepageItems,
  HomepageItem,
  HomepageItems,
} from "@/types/api/entry/homepage_item";
import {
  Card,
  For,
  Heading,
  HStack,
  Show,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import React, { useCallback } from "react";

import Endpoints, { useWSJSON } from "@/types/api/endpoints";
import { healthInfoUnknown, HealthMap } from "@/types/api/health";
import Conditional from "../conditional";
import { toaster } from "../ui/toaster";
import { AppCard } from "./app_card";
import { DashboardSettingsButton, useAllSettings } from "./settings";

function dummyItems(): HomepageItems {
  const items = [];
  for (let i = 0; i < 15; i++) {
    items.push(DummyHomepageItem());
  }
  return { Docker: items, Others: items };
}

function Category_({
  category,
  items,
  healthMap,
  isMobile,
}: Readonly<{
  category: string;
  items: HomepageItem[];
  healthMap: HealthMap;
  isMobile: boolean;
}>) {
  const {
    gridMode,
    itemGap,
    categoryFontSize,
    categoryPaddingX,
    categoryPaddingY,
  } = useAllSettings();

  return (
    <Card.Root borderRadius="lg" size="sm">
      <Card.Header pt={categoryPaddingY.val} px={categoryPaddingX.val}>
        <Stack direction={"row"}>
          <Heading fontWeight="medium" fontSize={categoryFontSize.val}>
            {category}
          </Heading>
          <DashboardSettingsButton size="md" />
        </Stack>
      </Card.Header>
      <Card.Body pb={categoryPaddingY.val} px={categoryPaddingX.val}>
        <Conditional
          condition={gridMode.val}
          whenTrue={SimpleGrid}
          trueProps={{
            columns: isMobile
              ? 1
              : items.length <= 2
                ? {
                    base: 2,
                    lgDown: 1,
                  }
                : {
                    "2xl": 5,
                    xl: 5,
                    lg: 4,
                    md: 3,
                    sm: 1,
                  },
          }}
          whenFalse={HStack}
          falseProps={{
            wrap: "wrap",
          }}
          common={{
            gap: itemGap.val,
          }}
        >
          <For each={items}>
            {(item) => (
              <AppCard
                key={item.alias}
                item={item}
                health={healthMap[item.alias] ?? healthInfoUnknown}
              />
            )}
          </For>
        </Conditional>
      </Card.Body>
    </Card.Root>
  );
}

const Category = React.memo(Category_);

export default function AppGroups({
  isMobile,
}: Readonly<{ isMobile: boolean }>) {
  const [homepageItems, setHomepageItems] =
    React.useState<HomepageItems>(dummyItems());
  const { data: healthMap, readyState } = useWSJSON<HealthMap>(
    Endpoints.HEALTH,
  );
  const { categoryGroupGap, categoryFilter, providerFilter } = useAllSettings();

  React.useEffect(() => {
    getHomepageItems({
      category: categoryFilter.val,
      provider: providerFilter.val,
    })
      .then((items) => {
        setHomepageItems(items);
      })
      .catch((error) => toaster.error(error));
  }, [categoryFilter.val, providerFilter.val]);

  const lessThanTwo = useCallback(
    () =>
      Object.entries(homepageItems).filter(([_, items]) => items.length <= 2),
    [homepageItems],
  );
  const others = useCallback(
    () =>
      Object.entries(homepageItems).filter(([_, items]) => items.length > 2),
    [homepageItems],
  );

  return (
    <Stack gap={categoryGroupGap.val}>
      {/* Categories with two or more items */}
      <For each={others()}>
        {([category, items]) => (
          <Category
            key={category}
            isMobile={isMobile}
            category={category}
            healthMap={healthMap ?? {}}
            items={items}
          />
        )}
      </For>

      {/* Categories with <= 2 items */}
      <Show when={lessThanTwo().length > 0}>
        <SimpleGrid columns={{ mdDown: 2, base: 2 }} gap={4}>
          <For each={lessThanTwo()}>
            {([category, items]) => (
              <Category
                key={category}
                isMobile={isMobile}
                category={category}
                healthMap={healthMap ?? {}}
                items={items}
              />
            )}
          </For>
        </SimpleGrid>
      </Show>
    </Stack>
  );
}
