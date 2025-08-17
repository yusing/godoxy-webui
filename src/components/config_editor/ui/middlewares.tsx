import { NamedListInput } from "@/components/input";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import {
  type MiddlewareCompose,
  MiddlewareComposeSchema,
} from "@/types/godoxy";
import { Tabs } from "@chakra-ui/react";
import React from "react";
import { LuPlus } from "react-icons/lu";

export function MiddlewareEditor({
  label,
  data,
  onChange,
}: {
  label?: React.ReactNode;
  data: MiddlewareCompose.MiddlewareCompose;
  onChange: (v: MiddlewareCompose.MiddlewareCompose) => void;
}) {
  return (
    <NamedListInput
      label={label}
      nameField="use"
      keyField="use"
      //@ts-ignore
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={data}
      onChange={(v) => {
        data = v as MiddlewareCompose.MiddlewareCompose;
        onChange(data);
      }}
    />
  );
}

export function MiddlewareComposeEditor({
  data,
  onChange,
}: {
  data: Record<string, MiddlewareCompose.MiddlewareCompose>;
  onChange: (v: Record<string, MiddlewareCompose.MiddlewareCompose>) => void;
}) {
  const [selectedTab, setSelectedTab] = React.useState(Object.keys(data)[0]);

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={({ value }) => setSelectedTab(value)}
      // orientation="vertical"
      lazyMount
      unmountOnExit
      fitted
    >
      <Tabs.List gap="4">
        {Object.keys(data).map((k, index) => (
          <Tabs.Trigger
            key={`${index}_tab`}
            value={k}
            height={"10"}
            justifyContent={"space-between"}
          >
            <div />
            {`${k} `}
            <CloseButton
              as="span"
              size="2xs"
              me="-2"
              onClick={(e) => {
                e.stopPropagation();
                const keys = Object.keys(data);
                const index = keys.indexOf(k);
                delete data[k];
                onChange(data);
                if (keys.length > 0) {
                  setSelectedTab(
                    keys[index > 0 ? index - 1 : 0] ?? keys[keys.length - 1]!,
                  );
                } else {
                  setSelectedTab("");
                }
              }}
            />
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator rounded="l2" />
        <Button
          alignSelf="center"
          ms="2"
          size="2xs"
          variant="ghost"
          onClick={() => {
            let i = Object.keys(data).length + 1;
            for (; data[i]; i++);
            data[i] = [];
            onChange(data);
          }}
        >
          <LuPlus />
        </Button>
      </Tabs.List>
      <Tabs.ContentGroup>
        {Object.entries(data).map(([k, v]) => (
          <Tabs.Content key={`${k}_content`} value={k}>
            <MiddlewareEditor
              label={k}
              data={v}
              onChange={(v) => {
                data[k] = v;
                onChange(data);
              }}
            />
          </Tabs.Content>
        ))}
      </Tabs.ContentGroup>
    </Tabs.Root>
  );
}
