import "@/styles/yaml_editor.css";
import {
  Badge,
  Box,
  Card,
  DialogRootProvider,
  HStack,
  IconButton,
  Input,
  Separator,
  Text,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import ReactCodeMirror, {
  EditorView,
  type Extension,
} from "@uiw/react-codemirror";
import { Copy, Search } from "lucide-react";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import { useColorMode } from "../ui/color-mode";
import { DataListItem, DataListRoot } from "../ui/data-list";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import type { Route } from "@/lib/api";
import "@/styles/yaml_editor.css";

const nonObjectFirst = (a: [string, unknown], b: [string, unknown]) => {
  const aIsObject = typeof a[1] === "object" && a[1] !== null;
  const bIsObject = typeof b[1] === "object" && b[1] !== null;

  if (!aIsObject && bIsObject) return -1;
  if (aIsObject && !bIsObject) return 1;
  return a[0].localeCompare(b[0]);
};

export function FullDetailDialog({
  route,
  dialog,
}: {
  route: Route;
  dialog: UseDialogReturn;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const filteredRoute = useMemo(() => {
    if (!searchTerm) return route;

    const filterObject = (obj: unknown): unknown | null => {
      if (typeof obj === "string") {
        return obj.toLowerCase().includes(searchTerm.toLowerCase())
          ? obj
          : null;
      }
      if (typeof obj === "object" && obj !== null) {
        const filtered: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
            filtered[key] = value;
          } else {
            const filteredValue = filterObject(value);
            if (filteredValue !== null) {
              filtered[key] = filteredValue;
            }
          }
        }
        return Object.keys(filtered).length > 0 ? filtered : null;
      }
      return obj?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ? obj
        : null;
    };

    return filterObject(route) || {};
  }, [route, searchTerm]);

  return (
    <DialogRootProvider
      placement="center"
      value={dialog}
      lazyMount
      unmountOnExit
    >
      <DialogContent
        overflow="hidden"
        maxH="85vh"
        maxW="80vw"
        minW="50vw"
        bg="white"
        _dark={{ bg: "gray.900" }}
        shadow="2xl"
        borderRadius="lg"
      >
        <DialogHeader
          borderBottom="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
        >
          <VStack align="stretch" gap={3} width="100%">
            <HStack justify="space-between">
              <DialogTitle fontSize="lg" fontWeight="semibold">
                Route Details
              </DialogTitle>
              <DialogCloseTrigger />
            </HStack>
            <HStack>
              <Search size={16} />
              <Input
                placeholder="Search in route data..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                size="sm"
                variant="outline"
                flex={1}
              />
              {searchTerm && (
                <Badge variant="outline" fontSize="xs">
                  Filtered
                </Badge>
              )}
            </HStack>
          </VStack>
        </DialogHeader>
        <DialogBody
          overflow="auto"
          p={4}
          bg="gray.50"
          _dark={{ bg: "gray.800" }}
        >
          <ObjectDataList v={filteredRoute} />
        </DialogBody>
      </DialogContent>
    </DialogRootProvider>
  );
}

const ObjectDataList = memo(function ObjectDataList({
  k,
  v,
  depth = 0,
}: {
  k?: string;
  v: unknown;
  depth?: number;
}) {
  // Prevent infinite recursion for deeply nested objects
  if (depth > 10) {
    return (
      <DataListItem
        key={k}
        label={k}
        value="[Too deeply nested to display]"
        w="100%"
      />
    );
  }

  if (typeof v === "object") {
    if (!v) {
      return <DataListItem key={k} label={k} value="null" w="100%" />;
    }

    if (!k) {
      return (
        <DataListRoot orientation="horizontal" gap={4}>
          {Object.entries(v)
            .toSorted(nonObjectFirst)
            .map(
              ([key, value]) =>
                value !== undefined && (
                  <ObjectDataList
                    key={key}
                    k={key}
                    v={value}
                    depth={depth + 1}
                  />
                ),
            )}
        </DataListRoot>
      );
    }

    return (
      <Card.Root
        size="sm"
        variant="outline"
        shadow="sm"
        borderRadius="md"
        mb={3}
      >
        <Card.Header pb={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold">{k}</Text>
            <Badge size="sm" variant="subtle">
              {Array.isArray(v) ? "Array" : "Object"}
            </Badge>
          </HStack>
          <Separator />
        </Card.Header>
        <Card.Body pt={0}>
          <ObjectDataList v={v} depth={depth + 1} />
        </Card.Body>
      </Card.Root>
    );
  }

  if (Array.isArray(v)) {
    return (
      <VStack align="stretch" gap={2}>
        {v.map((item, index) => (
          <ObjectDataList
            key={index}
            k={`${k ? `${k}[${index}]` : `[${index}]`}`}
            v={item}
            depth={depth + 1}
          />
        ))}
      </VStack>
    );
  }

  const renderedValue = useMemo(() => {
    let stringify = true;
    let processedValue: string | ReactNode = "";

    if (typeof v === "string") {
      if (v.includes("<!DOCTYPE html>") || v.includes("<html")) {
        processedValue = (
          <Box
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.300"
            _dark={{ borderColor: "gray.600" }}
          >
            <ReadonlyCodeMirror
              value={v}
              extensions={[html(), EditorView.lineWrapping]}
              language="html"
            />
          </Box>
        );
        stringify = false;
      } else if (
        ((v.includes("{") && v.includes("}")) ||
          (v.includes("[") && v.includes("]"))) &&
        v.includes('"')
      ) {
        processedValue = (
          <Box
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.300"
            _dark={{ borderColor: "gray.600" }}
          >
            <ReadonlyCodeMirror
              value={v}
              extensions={[json(), EditorView.lineWrapping]}
              language="json"
            />
          </Box>
        );
        stringify = false;
      }
    }

    if (stringify) {
      processedValue = `${v}`;
    }

    return processedValue;
  }, [v]);

  return (
    <DataListItem
      key={k}
      label={k}
      value={renderedValue as string | ReactNode}
      w="100%"
      wordBreak="break-word"
    />
  );
});

const ReadonlyCodeMirror = memo(function ReadonlyCodeMirror({
  value,
  extensions,
  language,
}: {
  value: string;
  extensions: Extension[];
  language?: string;
}) {
  const { colorMode } = useColorMode();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [value]);

  return (
    <Box position="relative" minH="100px">
      <HStack position="absolute" top={2} right={2} zIndex={10} gap={2}>
        {language && (
          <Badge size="sm" variant="solid" colorScheme="blue">
            {language.toUpperCase()}
          </Badge>
        )}
        <IconButton
          size="xs"
          variant="ghost"
          onClick={handleCopy}
          bg="rgba(255,255,255,0.9)"
          _dark={{ bg: "rgba(0,0,0,0.9)" }}
          _hover={{ bg: "rgba(255,255,255,1)", _dark: { bg: "rgba(0,0,0,1)" } }}
        >
          <Copy size={12} />
        </IconButton>
      </HStack>
      <ReactCodeMirror
        value={value}
        readOnly
        theme={colorMode === "dark" ? "dark" : "light"}
        extensions={extensions}
        style={{
          minHeight: "100px",
          width: "100%",
          fontSize: "12px",
        }}
      />
      {copied && (
        <Box
          position="absolute"
          top={2}
          right={16}
          bg="green.500"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
          zIndex={20}
        >
          Copied!
        </Box>
      )}
    </Box>
  );
});
