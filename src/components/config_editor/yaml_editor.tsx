"use client";

import { yaml } from "@codemirror/lang-yaml";
import CodeMirror, { Extension, hoverTooltip } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import { useConfigFileState } from "@/hooks/config_file";
import "@/styles/yaml_editor.css";
import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "@/types/godoxy";
import { linter } from "@codemirror/lint";
import { stateExtensions } from "codemirror-json-schema";
import { yamlSchemaHover, yamlSchemaLinter } from "codemirror-json-schema/yaml";
import { useCallback, useEffect, useState } from "react";
import { useBoolean, useDebounce } from "react-use";

function yamlSchema(schema: unknown) {
  return [
    yaml(),
    linter(yamlSchemaLinter(), {
      delay: 200,
    }),
    hoverTooltip(yamlSchemaHover()),
    stateExtensions(schema as Parameters<typeof stateExtensions>[0]),
  ];
}

const extensions: { [key: string]: Extension[] } = {
  config: yamlSchema(ConfigSchema),
  provider: yamlSchema(RoutesSchema),
  middleware: yamlSchema(MiddlewareComposeSchema),
};

function YAMLConfigEditor() {
  const { content, current, setContent } = useConfigFileState();
  const [localContent, setLocalContent] = useState(content);
  const [typing, setTyping] = useBoolean(false);

  const cmTheme = useTheme().resolvedTheme === "light" ? noctisLilac : coolGlow;

  const keyDown = useCallback(() => setTyping(true), [setTyping]);
  const keyUp = useCallback(() => setTyping(false), [setTyping]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", keyDown);
      window.addEventListener("keyup", keyUp);
    }
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [keyDown, keyUp]);

  useDebounce(
    () => {
      if (typing) return;
      setContent(localContent);
    },
    300,
    [localContent],
  );

  return (
    <CodeMirror
      extensions={extensions[current.type]}
      theme={cmTheme}
      value={localContent}
      autoFocus
      onChange={(value, _) => setLocalContent(value)}
      basicSetup={true}
      style={{
        fontSize: "14px",
        overflow: "auto",
      }}
    />
  );
}

export default YAMLConfigEditor;
