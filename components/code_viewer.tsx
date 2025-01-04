import { andromeda } from "@uiw/codemirror-theme-andromeda";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

export function CodeViewer({
  value,
  extensions,
}: {
  readonly value: string;
  readonly extensions?: Extension[];
}) {
  const { theme } = useTheme();

  return (
    <CodeMirror
      readOnly
      basicSetup={{
        lineNumbers: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
      editable={false}
      extensions={extensions}
      theme={theme === "light" ? githubLight : andromeda}
      value={value}
    />
  );
}
