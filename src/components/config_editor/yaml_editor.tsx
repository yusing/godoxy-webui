"use client";

import { yaml } from "@codemirror/lang-yaml";
import { lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { coolGlow, noctisLilac } from "thememirror";

import { useConfigFileContext } from "@/hooks/config_file";
import "@/styles/yaml_editor.css";

const YAMLConfigEditor: React.FC<React.CSSProperties> = ({ ...rest }) => {
  const { theme } = useTheme();
  const { content, setContent } = useConfigFileContext();
  let cmTheme = theme === "light" ? noctisLilac : coolGlow;

  return (
    <CodeMirror
      extensions={[yaml(), lintGutter()]}
      theme={cmTheme}
      value={content}
      onChange={(value, _) => setContent(value)}
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
