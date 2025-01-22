"use client";

import { For, Table, Tabs } from "@chakra-ui/react";
import { type AsyncListData, useAsyncList } from "@react-stately/data";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type Column,
  getReverseProxies,
  getStreams,
  type ReverseProxy,
  ReverseProxyColumns,
  type Stream,
  StreamColumns,
} from "@/types/api/proxy";
import { FaStream } from "react-icons/fa";
import { FaServer } from "react-icons/fa6";
import { MdRefresh } from "react-icons/md";

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
  return (
    <Table.Root
      interactive
      stickyHeader
      // sortDescriptor={list.sortDescriptor}
      // onSortChange={list.sort}
    >
      <Table.Header>
        <Table.Row>
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
        <For
          each={list.items}
          fallback={
            <EmptyState
              placeSelf={"center"}
              title="No routes"
              description="start some docker containers or add some routes in include files."
            />
          }
        >
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
    load: async ({ signal }) => ({ items: await getStreams(signal) }),
    sort,
  });

  const rps = useAsyncList<ReverseProxy>({
    load: async ({ signal }) => ({ items: await getReverseProxies(signal) }),
    sort,
  });

  const [activeList, setActiveList] = useState(rps);
  const [tab, setTab] = useState("reverse_proxies");

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(e) => {
        if (e.value === "reload") {
          return;
        }
        setTab(e.value);
        setActiveList(e.value === "reverse_proxies" ? rps : streams);
      }}
      px="4"
    >
      <Tabs.List gap={6}>
        <Tabs.Trigger value="reverse_proxies">
          <FaServer />
          Reverse Proxies
        </Tabs.Trigger>
        <Tabs.Trigger value="streams">
          <FaStream />
          Streams
        </Tabs.Trigger>
        <Button onClick={activeList.reload}>
          <MdRefresh />
        </Button>
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content
        key="reverse_proxies"
        value="reverse_proxies"
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
          key_prefix="reverse_proxies"
          columns={ReverseProxyColumns}
          list={rps}
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
