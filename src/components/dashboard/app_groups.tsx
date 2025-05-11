"use client";

import {
  DummyHomepageItem,
  HomepageItem,
  HomepageItems,
} from "@/types/api/route/homepage_item";
import {
  Box,
  Card,
  Editable,
  Float,
  For,
  HStack,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

import {
  getHiddenHomepageItems,
  getHomepageItems,
} from "@/lib/api/homepage_items";
import { toastError } from "@/types/api/endpoints";
import { overrideHomepage } from "@/types/api/homepage";
import { MdInfo } from "react-icons/md";
import { useAsync } from "react-use";
import Conditional from "../conditional";
import { ToggleTip } from "../ui/toggle-tip";
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

  // Keep track of the currently dragged item for overlays and highlighting
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track which categories are valid drop targets for the current drag
  const [dropTargets, setDropTargets] = useState<Record<string, boolean>>({});

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

  // State to manage the items for drag and drop
  const [localHomepageItems, setLocalHomepageItems] = useState<HomepageItems>(
    homepageItems.value ?? dummyItems(),
  );

  // Update localHomepageItems when homepageItems.value changes (e.g. after fetching)
  useAsync(async () => {
    if (homepageItems.value) {
      setLocalHomepageItems(homepageItems.value);
    }
  }, [homepageItems.value]);

  // Optimized sensors with activation constraints to improve performance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Only start dragging after moving 5px
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Start tracking the dragged item
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      setActiveId(id);

      // Find which category contains this item to track valid drop targets
      const targets: Record<string, boolean> = {};

      for (const catName of Object.keys(localHomepageItems || {})) {
        // All categories are potential drop targets
        targets[catName] = true;
      }

      setDropTargets(targets);
    },
    [localHomepageItems],
  );

  // Track when hovering over potential drop targets
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) return;

    // You could implement additional highlight logic here
    // For example, if you want to highlight only certain categories
    // when hovering over them
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      // Clear the active item and drop targets
      setActiveId(null);
      setDropTargets({});

      const { active, over } = event;

      // Ensure we have valid source and target
      if (!active || !over || active.id === over.id) {
        return;
      }

      // Prepare the ids as strings to work with
      const activeId = String(active.id);
      const overId = String(over.id);

      setLocalHomepageItems((prevItems) => {
        // Create a shallow copy of state
        const newItems: HomepageItems = { ...prevItems };

        // Track items that need to be updated via API
        const updatedItemsForApi: Record<string, HomepageItem> = {};

        // Find which category contains the active item
        let activeCategory = "";
        let activeCategoryItems: HomepageItem[] | undefined;
        let activeItemIndex = -1;

        // Find which category contains the target (or is the target if dropping directly on a category)
        let overCategory = "";
        let overCategoryItems: HomepageItem[] | undefined;
        let overItemIndex = -1;
        const isTargetCategory = Object.keys(newItems).includes(overId);

        // Find the source and target categories and indices
        for (const category of Object.keys(newItems)) {
          const items = newItems[category];
          if (!items) continue;

          // Look for active item
          const activeIdx = items.findIndex(
            (item) => item && item.alias === activeId,
          );
          if (activeIdx >= 0) {
            activeCategory = category;
            activeCategoryItems = items;
            activeItemIndex = activeIdx;
          }

          // Look for target item/category
          if (isTargetCategory && category === overId) {
            overCategory = category;
            overCategoryItems = items;
            overItemIndex = items.length; // Position at the end when dropping on a category
          } else {
            const overIdx = items.findIndex(
              (item) => item && item.alias === overId,
            );
            if (overIdx >= 0) {
              overCategory = category;
              overCategoryItems = items;
              overItemIndex = overIdx;
            }
          }
        }

        // If we couldn't find both source and target, abort
        if (
          !activeCategory ||
          !overCategory ||
          !activeCategoryItems ||
          !overCategoryItems ||
          activeItemIndex < 0
        ) {
          console.warn("Could not determine source or target", {
            activeId,
            overId,
            activeCategory,
            overCategory,
          });
          return prevItems;
        }

        // The item being dragged
        const draggedItem = activeCategoryItems[activeItemIndex];
        if (!draggedItem) {
          console.warn("Dragged item not found", {
            activeItemIndex,
            activeCategory,
          });
          return prevItems;
        }

        // Handle reordering within the same category
        if (activeCategory === overCategory) {
          // Same category reordering - use arrayMove for clean array handling
          const reordered = arrayMove(
            [...activeCategoryItems],
            activeItemIndex,
            overItemIndex,
          );
          newItems[activeCategory] = reordered;

          // Update sort orders
          reordered.forEach((item, index) => {
            if (item) {
              item.sort_order = index;
              updatedItemsForApi[item.alias] = { ...item, sort_order: index };
            }
          });
        }
        // Handle moving between different categories
        else {
          // Create copies of arrays to work with
          const sourceItems = [...activeCategoryItems];
          const destItems = [...overCategoryItems];

          // Remove from source array
          sourceItems.splice(activeItemIndex, 1);

          // Create a copy of item with updated category
          const itemWithNewCategory: HomepageItem = {
            ...draggedItem,
            category: overCategory,
          };

          // Insert into target array
          const insertIndex = Math.min(overItemIndex, destItems.length);
          destItems.splice(insertIndex, 0, itemWithNewCategory);

          // Update the state
          newItems[activeCategory] = sourceItems;
          newItems[overCategory] = destItems;

          // Update sort orders for both categories
          sourceItems.forEach((item, index) => {
            if (item) {
              item.sort_order = index;
              updatedItemsForApi[item.alias] = {
                ...item,
                category: activeCategory,
                sort_order: index,
              };
            }
          });

          destItems.forEach((item, index) => {
            if (item) {
              item.sort_order = index;
              updatedItemsForApi[item.alias] = {
                ...item,
                category: overCategory,
                sort_order: index,
              };
            }
          });
        }

        // Save changes to backend without blocking UI updates
        setTimeout(() => {
          overrideHomepage("items_batch", null, updatedItemsForApi).catch(
            toastError,
          );
        }, 0);

        return newItems;
      });
    },
    [overrideHomepage],
  );

  const lessThanTwo = useCallback(
    () =>
      Object.entries(localHomepageItems ?? {}).filter(
        ([_, items]) => items.length <= 2 && items.some((item) => item.show),
      ),
    [localHomepageItems],
  );

  const others = useCallback(
    () =>
      Object.entries(localHomepageItems ?? dummyItems()).filter(
        ([_, items]) => items.length > 2 && items.some((item) => item.show),
      ),
    [localHomepageItems],
  );

  // Function to find the dragged item data
  const getActiveItem = useCallback(() => {
    if (!activeId) return null;

    // Find the item in our data
    for (const category of Object.keys(localHomepageItems || {})) {
      const items = localHomepageItems?.[category];
      if (!items) continue;

      const item = items.find((item) => item.alias === activeId);
      if (item) return item;
    }

    return null;
  }, [activeId, localHomepageItems]);

  // The currently dragged item
  const activeItem = getActiveItem();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        position="relative"
        align={"flex-start"}
        w="full"
      >
        <Float placement={"top-start"} offsetX={-12} offsetY={3}>
          <ToggleTip
            content={
              <Stack fontSize={"sm"}>
                <Text>Right click on an app to edit/hide.</Text>
                <Text>Double click on a category to change its name.</Text>
                <Text>
                  Drag and drop to reorder apps or move between categories.
                </Text>
              </Stack>
            }
          >
            <IconButton variant={"ghost"} aria-label="info">
              <MdInfo />
            </IconButton>
          </ToggleTip>
          <DashboardSettingsButton
            size="md"
            getHiddenApps={() =>
              getHiddenHomepageItems(homepageItems.value ?? {})
            }
          />
        </Float>
        <Stack gap={categoryGroupGap.val}>
          {/* Categories with two or more items */}
          <For each={others()}>
            {([category, items]) => (
              <SortableContext
                key={category}
                items={items.map((i) => i.alias)}
                strategy={rectSortingStrategy}
              >
                <Box
                  position="relative"
                  outline={
                    activeId && dropTargets[category]
                      ? "2px dashed #3182ce"
                      : "none"
                  }
                  borderRadius="md"
                  transition="outline 0.2s ease-in-out"
                  p={activeId && dropTargets[category] ? 2 : 0}
                  m={activeId && dropTargets[category] ? -2 : 0}
                >
                  <Category
                    isMobile={isMobile}
                    category={category}
                    items={items}
                  />
                </Box>
              </SortableContext>
            )}
          </For>

          {/* Categories with <= 2 items */}
          <SimpleGrid columns={{ mdDown: 2, base: 2 }} gap={4}>
            <For each={lessThanTwo()}>
              {([category, items]) => (
                <SortableContext
                  key={category}
                  items={items.map((i) => i.alias)}
                  strategy={rectSortingStrategy}
                >
                  <Box
                    position="relative"
                    outline={
                      activeId && dropTargets[category]
                        ? "2px dashed #3182ce"
                        : "none"
                    }
                    borderRadius="md"
                    transition="outline 0.2s ease-in-out"
                    p={activeId && dropTargets[category] ? 2 : 0}
                    m={activeId && dropTargets[category] ? -2 : 0}
                  >
                    <Category
                      isMobile={isMobile}
                      category={category}
                      items={items}
                    />
                  </Box>
                </SortableContext>
              )}
            </For>
          </SimpleGrid>
        </Stack>
      </Stack>

      {/* Custom drag overlay - shows a preview of the dragged item */}
      <DragOverlay>
        {activeItem ? (
          <Box
            bg="bg"
            borderRadius="md"
            boxShadow="lg"
            p="3"
            opacity={0.8}
            maxWidth="300px"
            zIndex={1000}
          >
            <AppCard item={activeItem} />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
