"use client";

import { yaml } from "@codemirror/lang-yaml";
import CodeMirror, { Extension, hoverTooltip } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import { useConfigFileState } from "@/hooks/config_file";
import { useTyping } from "@/hooks/typing";
import "@/styles/yaml_editor.css";
import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "@/types/godoxy";
import { linter } from "@codemirror/lint";
import { stateExtensions } from "codemirror-json-schema";
import { yamlSchemaHover, yamlSchemaLinter } from "codemirror-json-schema/yaml";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

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
  const typing = useTyping();

  const cmTheme = useTheme().resolvedTheme === "light" ? noctisLilac : coolGlow;

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

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
