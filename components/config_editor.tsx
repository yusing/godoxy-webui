"use client";

import { yaml } from "@codemirror/lang-yaml";
import { andromeda } from "@uiw/codemirror-theme-andromeda";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import ConfigFile from "@/types/config_file";
import { formatError } from "@/types/endpoints";

export default function ConfigEditor({ file }: { readonly file: ConfigFile }) {
  const [editorValue, setEditorValue] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    file
      .getContent()
      .then(setEditorValue)
      .catch((e) => setEditorValue(formatError(e)));
  }, []);

  return (
    <CodeMirror
      extensions={[yaml()]}
      style={{ minWidth: "55vw" }}
      theme={theme === "light" ? githubLight : andromeda}
      value={editorValue}
      onChange={(value, _) => {
        file.setContent(value);
      }}
    />
  );
}
