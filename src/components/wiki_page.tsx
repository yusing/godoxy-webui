"use client";
import { bodyHeight } from "@/styles";
import { Box, For, HStack, Link, Table } from "@chakra-ui/react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { usePathname } from "next/navigation";
import { useAsync } from "react-use";
import sideBar from "./wiki_sidebar.json";

export default function WikiPage({ file }: Readonly<{ file: string }>) {
  const home = useAsync(async () => {
    return await fetch(`/wiki/${file}.md`).then((res) => res.text());
  });
  return (
    <HStack gap="4" align={"start"} justify={"space-between"}>
      <Box overflow={"auto"}>
        <MarkdownPreview
          source={home.value}
          skipHtml={false}
          style={{ padding: 24, background: "transparent" }}
        />
      </Box>
      <WikiSidebar />
    </HStack>
  );
}

function WikiSidebar() {
  const pathname = usePathname();
  return (
    <Box
      position={"sticky"}
      top={0}
      right={"0"}
      m={4}
      h={bodyHeight}
      w={"200px"}
      overflow={"auto"}
      border={"1px solid"}
      borderColor={"border.emphasized"}
      borderRadius={"md"}
    >
      <Table.Root size="sm" stickyHeader>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Pages</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <For each={sideBar}>
            {(item) => (
              <Table.Row key={item.name}>
                <Table.Cell>
                  <Link
                    href={item.link}
                    fontWeight={"medium"}
                    colorPalette={
                      pathname.slice("/docs/".length) === item.link
                        ? "purple"
                        : "blue"
                    }
                  >
                    {item.name}
                  </Link>
                </Table.Cell>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
