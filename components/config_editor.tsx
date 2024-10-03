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
  const extensions = [yaml()];
  const { theme } = useTheme();

  useEffect(() => {
    file
      .getContent()
      .then(setEditorValue)
      .catch((e) => setEditorValue(formatError(e)));
  }, []);

  return (
    <CodeMirror
      extensions={extensions}
      style={{ minWidth: "55vw" }}
      theme={theme === "light" ? githubLight : andromeda}
      value={editorValue}
      onChange={(value, _) => {
        file.setContent(value);
      }}
    />
  );
}
