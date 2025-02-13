"use client";

import { For, Table, Tabs } from "@chakra-ui/react";
import { type AsyncListData, useAsyncList } from "@react-stately/data";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type Column,
  getHTTPRoutes,
  getStreamRoutes,
  HTTPColumns,
  type ReverseProxy,
  type Stream,
  StreamColumns,
} from "@/types/api/routes";
import { FaStream } from "react-icons/fa";
import { FaServer } from "react-icons/fa6";
import { MdError, MdRefresh } from "react-icons/md";

async function sort<T = Stream | ReverseProxy>({
  items,
  sortDescriptor,
}: {
  items: T[];
  sortDescriptor: {
    column: string | number;
    direction: "ascending" | "descending";
  };
}) {
  return {
    items: items.toSorted((a, b) => {
      let first = a[sortDescriptor.column as keyof T];
      let second = b[sortDescriptor.column as keyof T];
      let cmp =
        ((typeof first === "string" && parseInt(first)) || first) <
        ((typeof second === "string" && parseInt(second)) || second)
          ? -1
          : 1;

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    }),
  };
}

function RenderTable({
  key_prefix,
  columns,
  list,
}: Readonly<{
  key_prefix: string;
  columns: Column[];
  list: AsyncListData<any>;
}>) {
  if (list.error) {
    return (
      <EmptyState
        placeSelf={"center"}
        icon={<MdError />}
        title="Error"
        description={list.error.message}
      />
    );
  }

  if (list.items?.length === 0) {
    return (
      <EmptyState
        placeSelf={"center"}
        title="No routes"
        description="start some docker containers or add some routes in include files."
      />
    );
  }

  return (
    <Table.Root
      interactive
      stickyHeader
      // sortDescriptor={list.sortDescriptor}
      // onSortChange={list.sort}
    >
      <Table.Header>
        <Table.Row bg="bg.emphasized">
          <For each={columns}>
            {(col) => (
              <Table.ColumnHeader key={`${key_prefix}_${col.key}`}>
                {col.label}
              </Table.ColumnHeader>
            )}
          </For>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <For each={list.items}>
          {(item) => (
            <Table.Row key={`${key_prefix}_${item.alias}`}>
              <For each={columns}>
                {(col) => (
                  <Table.Cell key={`${key_prefix}_${item.alias}_${col.key}`}>
                    {item[col.key]}
                  </Table.Cell>
                )}
              </For>
            </Table.Row>
          )}
        </For>
      </Table.Body>
    </Table.Root>
  );
}

export default function ProxiesPage() {
  const streams = useAsyncList<Stream>({
    load: async ({ signal }) => ({ items: await getStreamRoutes(signal) }),
    sort,
  });

  const httpRoutes = useAsyncList<ReverseProxy>({
    load: async ({ signal }) => ({ items: await getHTTPRoutes(signal) }),
    sort,
  });

  const [activeList, setActiveList] = useState(httpRoutes);
  const [tab, setTab] = useState("http");

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(e) => {
        if (e.value === "reload") {
          return;
        }
        setTab(e.value);
        setActiveList(e.value === "http" ? httpRoutes : streams);
      }}
      px="4"
    >
      <Tabs.List gap={6}>
        <Tabs.Trigger value="http">
          <FaServer />
          HTTP
        </Tabs.Trigger>
        <Tabs.Trigger value="streams">
          <FaStream />
          Streams
        </Tabs.Trigger>
        <Button onClick={activeList.reload} variant={"ghost"}>
          <MdRefresh />
        </Button>
      </Tabs.List>
      <Tabs.Content
        key="http"
        value="http"
        _open={{
          animationName: "fade-in, slide-in",
          animationDuration: "300ms",
        }}
        _closed={{
          animationName: "fade-out, slide-out",
          animationDuration: "120ms",
        }}
      >
        <RenderTable
          key_prefix="http"
          columns={HTTPColumns}
          list={httpRoutes}
        />
      </Tabs.Content>
      <Tabs.Content
        key="streams"
        value="streams"
        _open={{
          animationName: "fade-in, slide-in",
          animationDuration: "300ms",
        }}
        _closed={{
          animationName: "fade-out, slide-out",
          animationDuration: "120ms",
        }}
      >
        <RenderTable
          key_prefix="streams"
          columns={StreamColumns}
          list={streams}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
