import { NamedListInput } from "@/components/input";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { Tabs } from "@chakra-ui/react";
import {
  MiddlewareCompose,
  MiddlewareComposeSchema,
  Middlewares,
} from "godoxy-schemas";
import React from "react";
import { LuPlus } from "react-icons/lu";

const middlewareOptionsMap =
  MiddlewareComposeSchema.definitions.MiddlewareComposeMap.anyOf.reduce(
    (acc, m) => {
      m.properties.use.enum.forEach((u) => {
        acc[u] = Object.keys(m.properties);
      });
      return acc;
    },
    {} as { [key: string]: string[] },
  );

export const MiddlewareEditor: React.FC<{
  label?: React.ReactNode;
  data: MiddlewareCompose.MiddlewareCompose;
  onChange: (v: MiddlewareCompose.MiddlewareCompose) => void;
}> = ({ label, data, onChange }) => {
  return (
    <NamedListInput
      label={label}
      nameField="use"
      allowedNames={Middlewares.ALL_MIDDLEWARES}
      allowedKeys={middlewareOptionsMap}
      value={data}
      onChange={(v) => {
        data = v as MiddlewareCompose.MiddlewareCompose;
        onChange(data);
      }}
    />
  );
};

export const MiddlewareComposeEditor: React.FC<{
  data: Record<string, MiddlewareCompose.MiddlewareCompose>;
  onChange: (v: Record<string, MiddlewareCompose.MiddlewareCompose>) => void;
}> = ({ data, onChange }) => {
  const [selectedTab, setSelectedTab] = React.useState<string>("");

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={({ value }) => setSelectedTab(value)}
      // orientation="vertical"
      fitted
    >
      <Tabs.List gap="4">
        {Object.keys(data).map((k, index) => (
          <Tabs.Trigger
            key={`${k}_tab`}
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
};
