"use client";

import { useConfigFileContent } from "@/hooks/config_file";
import { useTyping } from "@/hooks/typing";
import {
  ConfigSchema,
  MiddlewareComposeSchema,
  RoutesSchema,
} from "@/types/godoxy";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import YAMLEditor from "../yaml_editor";

const schemas: Record<string, unknown> = {
  config: ConfigSchema,
  provider: RoutesSchema,
  middleware: MiddlewareComposeSchema,
};

function YAMLConfigEditor() {
  const [localContent, setLocalContent] = useState<string | null>(null);
  const typing = useTyping();
  const { content, current, setContent } = useConfigFileContent();

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
    <YAMLEditor
      value={localContent ?? content ?? ""}
      onChange={(value) => setLocalContent(value)}
      schema={schemas[current.type]}
    />
  );
}

export default YAMLConfigEditor;
