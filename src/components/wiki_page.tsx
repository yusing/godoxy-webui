"use client";
import {
  Box,
  Card,
  ClientOnly,
  For,
  HStack,
  Link,
  Stack,
} from "@chakra-ui/react";
import MarkdownPreview from "@uiw/react-markdown-preview";
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
      <Card.Root position={"sticky"} top={0} right={"0"}>
        <Card.Body>
          <ClientOnly>
            <Stack gap="4">
              <For each={sideBar}>
                {(item) => (
                  <HStack key={item.name}>
                    <Link
                      href={item.link}
                      fontWeight={"medium"}
                      colorPalette={
                        window.location.pathname.slice("/docs/".length) ===
                        item.link
                          ? "purple"
                          : "blue"
                      }
                    >
                      {item.name}
                    </Link>
                  </HStack>
                )}
              </For>
            </Stack>
          </ClientOnly>
        </Card.Body>
      </Card.Root>
    </HStack>
  );
}
