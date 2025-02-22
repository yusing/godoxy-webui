"use client";

import {
  DummyHomepageItem,
  HomepageItem,
  HomepageItems,
} from "@/types/api/route/homepage_item";
import {
  Card,
  Editable,
  For,
  HStack,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";

import {
  getHiddenHomepageItems,
  getHomepageItems,
} from "@/lib/api/homepage_items";
import { toastError } from "@/types/api/endpoints";
import { overrideHomepage } from "@/types/api/homepage";
import { useAsync } from "react-use";
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
  isMobile,
}: Readonly<{
  category: string;
  items: HomepageItem[];
  isMobile: boolean;
}>) {
  const {
    gridMode,
    itemGap,
    categoryFontSize,
    categoryPaddingX,
    categoryPaddingY,
  } = useAllSettings();

  const [categoryName, setCategoryName] = useState(category);

  if (items.filter((item) => item.show).length === 0) return null;

  return (
    <Card.Root
      size="sm"
      variant={"subtle"}
      px={categoryPaddingX.val}
      pt={categoryPaddingY.val}
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
          <Editable.Preview placeSelf="flex-start" w="fit" />
          <Editable.Input mt="-1" w="fit" />
        </Editable.Root>
      </Card.Header>
      <Card.Body pb={categoryPaddingY.val}>
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
            {(item) => <AppCard key={item.alias} item={item} />}
          </For>
        </Conditional>
      </Card.Body>
    </Card.Root>
  );
}

export default function AppGroups({
  isMobile,
}: Readonly<{ isMobile: boolean }>) {
  const { categoryGroupGap, categoryFilter, providerFilter } = useAllSettings();

  const homepageItems = useAsync(
    async () =>
      await getHomepageItems({
        category: categoryFilter.val,
        provider: providerFilter.val,
      }).catch((error) => {
        toastError(error);
        return dummyItems();
      }),
    [categoryFilter.val, providerFilter.val],
  );

  const lessThanTwo = useCallback(
    () =>
      Object.entries(homepageItems.value ?? {}).filter(
        ([_, items]) => items.length <= 2,
      ),
    [homepageItems.value],
  );

  const others = useCallback(
    () =>
      Object.entries(homepageItems.value ?? dummyItems()).filter(
        ([_, items]) => items.length > 2,
      ),
    [homepageItems.value],
  );

  return (
    <Stack direction={isMobile ? "column" : "row"}>
      <DashboardSettingsButton
        size="md"
        hiddenApps={getHiddenHomepageItems(homepageItems.value ?? {})}
      />
      <Stack gap={categoryGroupGap.val}>
        {/* Categories with two or more items */}
        <For each={others()}>
          {([category, items]) => (
            <Category
              key={category}
              isMobile={isMobile}
              category={category}
              items={items}
            />
          )}
        </For>

        {/* Categories with <= 2 items */}
        <SimpleGrid columns={{ mdDown: 2, base: 2 }} gap={4}>
          <For each={lessThanTwo()}>
            {([category, items]) => (
              <Category
                key={category}
                isMobile={isMobile}
                category={category}
                items={items}
              />
            )}
          </For>
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
