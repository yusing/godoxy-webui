"use client";

import { api } from "@/lib/api-client";
import {
  Flex,
  type FlexProps,
  Group,
  HStack,
  Input,
  InputElement,
  Spacer,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { MdError } from "react-icons/md";
import { useAsync } from "react-use";
import { FavIcon } from "../dashboard/favicon";
import { Button } from "../ui/button";
import { CloseButton } from "../ui/close-button";
import { EmptyState } from "../ui/empty-state";
import { Field } from "../ui/field";
import { Tag } from "../ui/tag";

type IconMetadata = {
  Source: string;
  Ref: string;
  SVG: boolean;
  PNG: boolean;
  WebP: boolean;
  Light: boolean;
  Dark: boolean;
};

function iconURL(metadata: IconMetadata) {
  if (metadata.SVG) {
    return `${metadata.Source}/${metadata.Ref}.svg`;
  }
  if (metadata.WebP) {
    return `${metadata.Source}/${metadata.Ref}.webp`;
  }
  return `${metadata.Source}/${metadata.Ref}.png`;
}

function iconURLVariant(metadata: IconMetadata, variant: "light" | "dark") {
  return `${metadata.Source}/${metadata.Ref}-${variant}.${metadata.SVG ? "svg" : metadata.WebP ? "webp" : "png"}`;
}

function asSearchValue(fullValue: string) {
  return fullValue
    .replace(/\.(svg|webp|png)$/, "")
    .replace(/-light|-dark$/, "");
}

function IconElement({
  metadata,
  variant,
  ...props
}: {
  metadata: IconMetadata;
  variant: "light" | "dark";
} & FlexProps) {
  const { theme } = useTheme();
  return (
    <Flex
      bg={theme === variant ? "fg" : undefined}
      borderRadius={"full"}
      bgSize={"28px"}
      {...props}
    >
      <FavIcon url={iconURLVariant(metadata, variant)} size="28px" />
    </Flex>
  );
}

export function IconSearcher({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<StackProps, "onChange" | "value">) {
  const [searchValue, setSearchValue] = useState(asSearchValue(value));
  const [focused, setFocused] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<IconMetadata | null>(null);
  const [currentVariant, setCurrentVariant] = useState<"light" | "dark" | null>(
    null,
  );
  const icons = useAsync(
    async () =>
      await api.icons
        .icons({ keyword: searchValue, limit: 10 })
        .then((e) => e.data),
    [searchValue],
  );

  return (
    <Stack gap={focused ? 1 : 0} w="full" {...rest}>
      <Field label="Icon" borderBottomRadius={"none"}>
        <Group w="full">
          <Input
            placeholder="Start typing to fuzzy search an icon, or paste a URL"
            value={currentIcon ? iconURL(currentIcon) : searchValue}
            onChange={(e) => {
              setCurrentIcon(null);
              setSearchValue(e.target.value);
              onChange(e.target.value);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <InputElement placement="end">
            <HStack gap="2">
              {currentIcon?.Light && (
                <Tag
                  colorPalette={
                    currentVariant === "light" ? "green" : undefined
                  }
                >
                  Light
                </Tag>
              )}
              {currentIcon?.Dark && (
                <Tag
                  colorPalette={currentVariant === "dark" ? "green" : undefined}
                >
                  Dark
                </Tag>
              )}
              <CloseButton
                variant={"plain"}
                onClick={() => {
                  setSearchValue("");
                  setCurrentIcon(null);
                  setCurrentVariant(null);
                  onChange("");
                }}
              />
            </HStack>
          </InputElement>
        </Group>
      </Field>
      <Stack
        overflow={"auto"}
        maxH="250px"
        w={"full"}
        roundedBottom={"md"}
        bg="var(--input-bg)"
      >
        {icons.error ? (
          <EmptyState
            icon={<MdError />}
            title={"Error loading icons"}
            description={icons.error.message}
          />
        ) : !icons.value || icons.value.length === 0 ? (
          <EmptyState title={"No result"} />
        ) : (
          icons.value.map((metadata) => (
            <Button
              variant={"ghost"}
              p="0"
              justifyContent={"flex-start"}
              key={`${metadata.Source}:${metadata.Ref}`}
            >
              <HStack
                color="fg.info"
                gap="2"
                textAlign={"left"}
                justify={"left"}
              >
                <Tag minW="85px">{metadata.Source}</Tag>
                <Text
                  onClick={() => {
                    setCurrentIcon(metadata);
                    setCurrentVariant(null);
                    onChange(iconURL(metadata));
                  }}
                >
                  {metadata.Ref}{" "}
                </Text>
                <FavIcon
                  url={iconURL(metadata)}
                  size="28px"
                  onClick={() => {
                    setCurrentIcon(metadata);
                    setCurrentVariant(null);
                    onChange(iconURL(metadata));
                  }}
                />
                {metadata.Light && (
                  <IconElement
                    metadata={metadata}
                    variant="light"
                    onClick={() => {
                      setCurrentIcon(metadata);
                      setCurrentVariant("light");
                      onChange(iconURLVariant(metadata, "light"));
                    }}
                  />
                )}
                {metadata.Dark && (
                  <IconElement
                    metadata={metadata}
                    variant="dark"
                    onClick={() => {
                      setCurrentIcon(metadata);
                      setCurrentVariant("dark");
                      onChange(iconURLVariant(metadata, "dark"));
                    }}
                  />
                )}
                <Spacer
                  onClick={() => {
                    setCurrentIcon(metadata);
                    setCurrentVariant(null);
                    onChange(iconURL(metadata));
                  }}
                />
              </HStack>
            </Button>
          ))
        )}
      </Stack>
    </Stack>
  );
}
