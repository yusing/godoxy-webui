"use client";

import {
  DummyHomepageItem,
  getHiddenHomepageItems,
  getHomepageItems,
  HomepageItem,
  HomepageItems,
} from "@/types/api/entry/homepage_item";
import {
  Card,
  Editable,
  For,
  HStack,
  Show,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import React, { useCallback } from "react";

import Endpoints, { toastError, useWSJSON } from "@/types/api/endpoints";
import { healthInfoUnknown, HealthMap } from "@/types/api/health";
import { overrideHomepage } from "@/types/api/homepage";
import Conditional from "../conditional";
import { AppCard } from "./app_card";
import { DashboardSettingsButton, useAllSettings } from "./settings";

function dummyItems(): HomepageItems {
  const items = [];
  for (let i = 0; i < 15; i++) {
    items.push(DummyHomepageItem());
  }
  return { Docker: items, Others: items };
}

function Category({
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

  const [categoryName, setCategoryName] = React.useState(category);

  return (
    <Card.Root
      size="sm"
      borderRadius="lg"
      variant={"subtle"}
      bg="bg.subtle"
      py={categoryPaddingY.val}
      px={categoryPaddingX.val}
    >
      <Card.Header pt={0} mx={-1}>
        <Editable.Root
          value={categoryName}
          required
          autoCapitalize="words"
          fontWeight="medium"
          fontSize={categoryFontSize.val}
          activationMode="dblclick"
          onValueChange={({ value }) => {
            setCategoryName(value);
          }}
          onValueCommit={({ value }) => {
            items.forEach((item) => (item.category = value));
            overrideHomepage(
              "items_batch",
              null,
              items.reduce(
                (acc, item) => {
                  acc[item.alias] = item;
                  return acc;
                },
                {} as Record<string, HomepageItem>,
              ),
            ).catch((e) => {
              toastError(e);
              setCategoryName(category);
            });
          }}
        >
          <Editable.Preview alignItems="flex-start" width="full" />
          <Editable.Input mt="-1" />
        </Editable.Root>
      </Card.Header>
      <Card.Body>
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
                    "2xl": 6,
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
      .catch((error) => toastError(error));
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
    <Stack direction={isMobile ? "column" : "row"}>
      <DashboardSettingsButton
        size="md"
        hiddenApps={getHiddenHomepageItems(homepageItems)}
      />
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
    </Stack>
  );
}
