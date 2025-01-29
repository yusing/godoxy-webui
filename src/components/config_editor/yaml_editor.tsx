"use client";

import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import "@/styles/yaml_editor.css";
import { ConfigFileContextType } from "@/types/file";

const YAMLConfigEditor: React.FC<
  {
    ctx: ConfigFileContextType;
  } & React.CSSProperties
> = ({ ctx, ...rest }) => {
  const { theme } = useTheme();

  let cmTheme = theme === "light" ? noctisLilac : coolGlow;

  return (
    <CodeMirror
      extensions={[yaml(), lintGutter()]}
      theme={cmTheme}
      value={ctx.content}
      onChange={(value, _) => ctx.setContent(value)}
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
