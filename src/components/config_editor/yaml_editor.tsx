"use client";

import { yaml } from "@codemirror/lang-yaml";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import { useConfigFileContext } from "@/hooks/config_file";
import "@/styles/yaml_editor.css";
import React from "react";
import { useDebounce } from "react-use";

const YAMLConfigEditor: React.FC<React.CSSProperties> = ({ ...rest }) => {
  const { theme } = useTheme();
  const { content, setContent } = useConfigFileContext();
  const [localContent, setLocalContent] = React.useState(content);
  // Pass content directly to avoid cursor jumps due to deferred/lazy updates
  let cmTheme = theme === "light" ? noctisLilac : coolGlow;

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useDebounce(() => setContent(localContent), 500, [localContent]);

  return (
    <CodeMirror
      extensions={[yaml()]}
      theme={cmTheme}
      value={localContent}
      autoFocus
      onChange={(value, _) => setLocalContent(value)}
      basicSetup={true}
      style={{
        fontSize: "14px",
        overflow: "auto",
        ...rest,
      }}
    />
  );
};

export default YAMLConfigEditor;
