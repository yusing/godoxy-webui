"use client";

import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import "@/styles/yaml_editor.css";
import { ConfigFileContextType } from "@/types/file";
import { bodyHeight, bodyWidth } from "@/types/styles";

const YAMLConfigEditor: React.FC<{
  ctx: ConfigFileContextType;
}> = ({ ctx }) => {
  const { theme } = useTheme();

  let cmTheme = theme === "light" ? noctisLilac : coolGlow;
  let panelTheme = EditorView.theme({
    ".cm-diagnostic": {
      backgroundColor: "inherit !important",
    },
  });

  return (
    <CodeMirror
      extensions={[panelTheme, yaml(), lintGutter()]}
      theme={cmTheme}
      value={ctx.content}
      onChange={(value, _) => ctx.setContent(value)}
      height={bodyHeight}
      width={bodyWidth}
      basicSetup={true}
      style={{
        fontSize: "14px",
        overflow: "auto",
      }}
    />
  );
};

export default YAMLConfigEditor;
