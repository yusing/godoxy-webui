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

export function MiddlewareEditor<
  T extends
    | MiddlewareCompose.EntrypointMiddlewares
    | MiddlewareCompose.MiddlewareCompose,
>({
  label,
  data,
  onChange,
}: {
  label?: React.ReactNode;
  data: T;
  onChange: (v: T) => void;
}) {
  return (
    <NamedListInput
      label={label}
      nameField="use"
      keyField="use"
      //@ts-ignore
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={
        Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              use: middlewareUseToSnakeCase(item.use),
            }))
          : Object.entries(data).reduce((acc, [k, v]) => {
              acc.push({
                ...v,
                //@ts-expect-error
                use: middlewareUseToSnakeCase(k),
              });
              return acc;
            }, [] as MiddlewareCompose.EntrypointMiddlewares)
      }
      onChange={(v) => {
        data = v as T;
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
            data[i] = {};
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

function middlewareUseToSnakeCase(use: string) {
  if (!use) return "";
  if (use in middlewareSnakeCaseMap) {
    return middlewareSnakeCaseMap[use as keyof typeof middlewareSnakeCaseMap];
  }
  return use;
}

const middlewareSnakeCaseMap = {
  customErrorPage: "error_page",
  CustomErrorPage: "error_page",
  errorPage: "error_page",
  ErrorPage: "error_page",
  redirectHTTP: "redirect_http",
  RedirectHTTP: "redirect_http",
  setXForwarded: "set_x_forwarded",
  SetXForwarded: "set_x_forwarded",
  hideXForwarded: "hide_x_forwarded",
  HideXForwarded: "hide_x_forwarded",
  cidrWhitelist: "cidr_whitelist",
  CIDRWhitelist: "cidr_whitelist",
  cloudflareRealIP: "cloudflare_real_ip",
  CloudflareRealIP: "cloudflare_real_ip",
  realIP: "real_ip",
  RealIP: "real_ip",
  request: "request",
  Request: "request",
  modifyRequest: "request",
  ModifyRequest: "request",
  response: "response",
  Response: "response",
  modifyResponse: "response",
  ModifyResponse: "response",
  oidc: "oidc",
  OIDC: "oidc",
  rateLimit: "rate_limit",
  RateLimit: "rate_limit",
  hcaptcha: "h_captcha",
  hCaptcha: "h_captcha",
  modifyHTML: "modify_html",
  ModifyHTML: "modify_html",
} as const;
